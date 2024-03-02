"use client"
import { GetSubmissionResponse } from "@/protobufs/services/v1/submission_service_pb";
import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";
import { BarChart as MuiBarChart } from '@mui/x-charts';
import { useState } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";

const HistogramChart = ({ data }: { data: any }) => {
  const xAxisData: string[] = data.map(item => item.name);
  const seriesData: number[] = data.map(item => item.value);

  return (
    <div>
      <MuiBarChart
        xAxis={[{ scaleType: 'band', data: xAxisData }]}
        series={[{ data: seriesData }]}
        width={500}
        height={300}
      />
    </div>
  );
};

interface Stats {
    mean: number;
    min: number;
    max: number;
    distribution: Record<string, number>;

export default function SolutionRuntimeDistributionGraph({ submissions }: { submissions: GetSubmissionResponse[] }) {
    const testRuntimes = submissions.reduce<Record<string, number[]>>((acc, submission) => {
        submission.testResults.forEach(({ testId, runtime }) => {
            if (!acc[testId]) {
                acc[testId] = [];
            }

            acc[testId].push(runtime);
        });

        return acc;
    }, {});

    const test = testRuntimes[0];

    const calculateStats = (runtimes: number[]): Stats => {
        const runtimesInMs = runtimes.map(runtime => runtime * 1000);

        runtimesInMs.sort((a, b) => a - b);
        const q1 = runtimesInMs[Math.floor(runtimesInMs.length / 4)];
        const q3 = runtimesInMs[Math.floor(runtimesInMs.length * (3 / 4))];
        const iqr = q3 - q1;

        // Filtering out outliers
        const filteredRuntimes = runtimesInMs.filter(runtime => 
            runtime >= (q1 - 1.5 * iqr) && runtime <= (q3 + 1.5 * iqr)
        );

        const min = Math.min(...filteredRuntimes);
        const max = Math.max(...filteredRuntimes);

        const mean = filteredRuntimes.reduce((acc, val) => acc + val, 0) / filteredRuntimes.length;

        const range = max - min;
        const numBins = 10;
        const binSize = range / numBins;

        const distribution: Record<string, number> = {};

        filteredRuntimes.forEach(runtime => {
            const binIndex = Math.floor((runtime - min) / binSize);
            const binMin = min + binIndex * binSize;
            const binMax = binMin + binSize;
            const binKey = `${binMin.toFixed(1)}-${binMax.toFixed(1)}ms`;
            distribution[binKey] = (distribution[binKey] || 0) + 1;
        });

        return { mean, min, max, distribution };
    };
      
    const statsMap: Record<string, Stats> = Object.fromEntries(
        Object.entries(testRuntimes).map(([testId, runtimes]) => [testId, calculateStats(runtimes)])
    );

    const histogramData = Object.entries(statsMap).map(([testId, { distribution }]) => ({
        testId,
        data: Object.entries(distribution).map(([range, count]) => ({
          name: range,
          value: count,
        })),
    }));

    const [selectedTestId, setSelectedTestId] = useState<string>(histogramData[0].testId);

    const handleChange = (event: SelectChangeEvent) => {
        setSelectedTestId(event.target.value as string);
    };

    const selectedData = histogramData.find(data => data.testId === selectedTestId)?.data ?? [];

    return (
        <Box>
            <FormControl fullWidth>
                <InputLabel id="test-id-select-label">Test ID</InputLabel>
                <Select
                    labelId="test-id-select-label"
                    value={selectedTestId}
                    label="Test ID"
                    onChange={handleChange}
                >
                {histogramData.map(({ testId }) => (
                    <MenuItem key={testId} value={testId}>
                        {testId}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>

            {selectedData.length > 0 && <HistogramChart data={selectedData} />}
        </Box>
    )
}
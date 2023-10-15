import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';

export default function CodeEditor() {
    return <TextField id="outlined-textarea" label="Editor" placeholder="..." multiline fullWidth rows={40} />;
}

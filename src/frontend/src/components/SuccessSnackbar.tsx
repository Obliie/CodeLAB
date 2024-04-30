import Alert from "@mui/material/Alert";
import Slide, { SlideProps } from "@mui/material/Slide";
import Snackbar from "@mui/material/Snackbar";


function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />;
}

export default function SuccessSnackbar({ message, open, setOpen }: { message: string, open: boolean, setOpen: Function }) {
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            TransitionComponent={SlideTransition}
        >
        <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: '100%' }}>
            {message}
        </Alert>
    </Snackbar>
    )
}
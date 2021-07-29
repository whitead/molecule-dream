import { Card, CardContent, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    card: {

    },
    title: {
        fontSize: 14,
    },
}));

export default function MolCard(props) {
    const [title, setTitle] = useState('');
    const classes = useStyles();

    function test(x) {
        setTitle(x);
    }

    return (
        <Card className={classes.card} variant="outlined">
            <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    {title}
                </Typography>
                <canvas id={props.canvas_id} width='250' height='200'></canvas>
            </CardContent>
        </Card>
    );
}


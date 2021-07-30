import { Card, CardContent, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    finalCard: {
    },
    card: {
        background: 'linear-gradient(45deg, #da90a0 30%, #dc9974 90%)',
        color: '#333'
    },
    title: {
        fontSize: 14,
    },
}));

export default function MolCard(props) {
    const classes = useStyles();

    return (
        <Card className={props.fixedTitle ? classes.finalCard : classes.card} variant={props.fixedTitle ? "elevation" : "outlined"}>
            <CardContent>
                <Typography className={classes.title} gutterBottom>
                    {props.fixedTitle ? props.fixedTitle : props.title}
                </Typography>
                <canvas id={props.canvas_id} width='250' height='200'></canvas>
            </CardContent>
        </Card>
    );
}


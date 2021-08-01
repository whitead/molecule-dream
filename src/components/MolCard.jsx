import { Card, IconButton, CardActions, Button, CardContent, Typography, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import AssignmentIcon from '@material-ui/icons/Assignment';
import React, { useState } from 'react';
import copy from 'clipboard-copy';

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
        wordWrap: 'break-word'
    },
    code: {
        fontFamily: 'monospace'
    },
    flexCont: {
        display: 'flex',
        justifyContent: 'center'
    }
}));

export default function MolCard(props) {
    const classes = useStyles();
    const [copied, setCopied] = useState('');

    return (
        <Card className={props.fixedTitle ? classes.finalCard : classes.card} variant={props.fixedTitle ? "elevation" : "outlined"}>

            <CardContent>
                <Typography className={classes.title} gutterBottom>
                    Smiles {copied === 'smiles' && '(copied)'}
                    <br />
                    {`${props.fixedTitle ? props.fixedTitle : props.title}`}
                    {props.fixedTitle &&
                        <IconButton aria-label="copySmiles" onClick={(e) => copy(props.fixedTitle) && setCopied('smiles')}>
                            <AssignmentIcon fontSize="small"></AssignmentIcon>
                        </IconButton>
                    }
                </Typography>
                <div className={classes.flexCont}>
                    <canvas id={props.canvas_id} width={props.canvas.width} height={props.canvas.height}></canvas>

                </div>
                {props.selfies &&
                    <React.Fragment>
                        <Typography className={classes.title}>
                            Selfies {copied === 'selfies' && '(copied)'}
                        </Typography>
                        <Divider />
                        <Typography className={classes.code} variant="body2" component="p">
                            {props.selfies}
                            {props.fixedTitle &&
                                <IconButton aria-label="copySelfies" onClick={(e) => copy(props.selfies) && setCopied('selfies')}>
                                    <AssignmentIcon fontSize="small"></AssignmentIcon>
                                </IconButton>
                            }
                        </Typography>
                    </React.Fragment>
                }
                {(props.title || props.fixedTitle) &&
                    <CardActions>
                        <Button variant='contained' color="primary"
                            target="_blank"
                            href={`http://zinc15.docking.org/substances/?ecfp4_fp-tanimoto-0.1=${props.fixedTitle ? encodeURIComponent(props.fixedTitle) : encodeURIComponent(props.title)}`}>
                            Similar Real Molecules
                        </Button>
                    </CardActions>
                }
            </CardContent>
        </Card >
    );
}


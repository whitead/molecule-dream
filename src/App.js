
import { Card, CssBaseline, ThemeProvider, Container, Grid, CardContent, CardActions, Paper, TextField, Typography, Button } from '@material-ui/core'
import React, { useState, useEffect } from 'react';
import { makeStyles, createTheme } from '@material-ui/core/styles';
import SmilesDrawer from 'smiles-drawer'
import MolCard from './components/MolCard'
import selfies_mod from './selfies';

const darkTheme = createTheme({
  palette: {
    type: 'dark',
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  item: {
    margin: theme.spacing(2)
  },
  title: {
    fontSize: 14,
  },
}));

function updateSmiles(s, canvas_id, drawer) {
  SmilesDrawer.parse(selfies_mod.selfies2smiles(s), (tree) => {
    drawer.draw(tree, canvas_id);
  }, (err) => {

  });
}

export default function App(props) {
  const classes = useStyles();
  let options = { theme: 'dark', width: '250', height: '200' };
  let smilesDrawer = new SmilesDrawer.Drawer(options);
  let cardArray = Array.from({ length: props.cardCount }, (e, i) => {
    return (<MolCard canvas_id={`test_${i}`} ></MolCard >);
  });
  let gCardArray = cardArray.map((c, i) => {
    return (
      <Grid className={classes.item} key={i} item xs={2}>
        {c}
      </Grid>
    );
  });

  const [selfie, setSelfie] = useState('CC');
  const [index, setIndex] = useState(0);

  const textEvent = (e) => {
    if (e.key === 'Enter') {
      setIndex((index + 1) % props.cardCount);
      setSelfie('');
    }
  }

  useEffect(() => {
    updateSmiles(selfie, cardArray[index].props.canvas_id, smilesDrawer);
    //cardArray[index].test(selfie);
  });

  // Similar to componentDidMount and componentDidUpdate:  useEffect(() => {    // Update the document title using the browser API    document.title = `You clicked ${count} times`;  });
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Typography align="center" variant="h2" component="h2" gutterBottom>
          Selfies Dreamer
        </Typography>
        <TextField variant='standard' fullWidth value={selfie} onChange={(e) => setSelfie(e.target.value)} onKeyDown={textEvent} />
      </Container>
      <div className={classes.root}>
        <Grid container spacing={3}>
          {gCardArray}
        </Grid>
      </div >
    </ThemeProvider>
  );
}

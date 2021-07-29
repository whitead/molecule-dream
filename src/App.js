
import { Divider, CssBaseline, ThemeProvider, Container, Grid, Button, CardActions, Paper, TextField, Typography } from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment';
import React, { useState, useEffect } from 'react';
import { makeStyles, createTheme } from '@material-ui/core/styles';
import SmilesDrawer from 'smiles-drawer'
import MolCard from './components/MolCard'
//import selfies_mod from './selfies';

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
  //SmilesDrawer.parse(selfies_mod.selfies2smiles(s), (tree) => {
    SmilesDrawer.parse(s, (tree) => {
    drawer.draw(tree, canvas_id);
  }, (err) => {

  });
}

export default function App(props) {
  const classes = useStyles();


  const [titles, setTitles] = useState(Array.from({ length: props.cardCount }, (e, i) => ''))
  const [smiles, setsmiles] = useState('CC');
  const [index, setIndex] = useState(0);

  let options = { theme: 'dark', width: '250', height: '200' };
  let smilesDrawer = new SmilesDrawer.Drawer(options);

  let cardArray = titles.map((e, i) => {
    return (<MolCard fixedTitle={e} title={i === index ? smiles : ''} canvas_id={`test_${i}`} ></MolCard >);
  });
  let gCardArray = cardArray.map((c, i) => {
    return (
      <Grid className={classes.item} key={i} item xs={2}>
        {c}
      </Grid>
    );
  });


  const finalizeCard = () => {
      setTitles([...titles.slice(0, index), smiles, ...titles.slice(index + 1)])
      setIndex((index + 1) % props.cardCount);
      setsmiles('');
  }

  useEffect(() => {
    updateSmiles(smiles, cardArray[index].props.canvas_id, smilesDrawer);
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Typography align="center" variant="h2" component="h2" gutterBottom>
          Important Message
        </Typography>
        <TextField variant='outlined' fullWidth value={smiles} onChange={(e) => setsmiles(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter') finalizeCard()}}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                          <Button color="secondary" onClick={finalizeCard}> ✍️</Button>
                    </InputAdornment>
                  ),
                }}/>
      </Container>
      <div className={classes.root}>
        <br/>
        <Grid container spacing={3}>
          {gCardArray}
        </Grid>
      </div >
    </ThemeProvider>
  );
}


import { Card, CardContent, CssBaseline, ThemeProvider, Container, Grid, Button, TextField, Typography } from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment';
import React, { useState, useEffect } from 'react';
import { makeStyles, createTheme } from '@material-ui/core/styles';
import SmilesDrawer from 'smiles-drawer';
import MolCard from './components/MolCard';
import rnn from './lib/rnn';
import rnnMod from './lib/rnn';
import selfies_mod from './lib/selfies';

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
  SmilesDrawer.parse(s, (tree) => {
    drawer.draw(tree, canvas_id);
  }, (err) => {

  });
}

const options = { theme: 'dark', width: '250', height: '200' };
const smilesDrawer = new SmilesDrawer.Drawer(options);

export default function App(props) {
  const classes = useStyles();


  const [titles, setTitles] = useState(Array.from({ length: 1 }, (e, i) => ''))
  const [selfiesTitles, setSelfiesTitles] = useState(Array.from({ length: 1 }, (e, i) => ''))
  const [smiles, setSmiles] = useState('');
  const [rnnX, setRnnX] = useState(rnn.selfie2vec('[nop]'));
  const [selfies, setSelfies] = useState('[nop]');

  let cardArray = titles.map((e, i) => {
    return (<MolCard fixedTitle={e}
      selfies={selfiesTitles[i]} title={i === titles.length - 1 ? smiles : ''}
      canvas_id={`test_${i}`} ></MolCard >);
  });
  let gCardArray = cardArray.map((c, i) => {
    return (
      <Grid className={classes.item} key={i} item xs={2}>
        {c}
      </Grid>
    );
  });

  const finalizeCard = () => {
    setTitles([...titles.slice(0, -1), smiles, ''])
    setSelfiesTitles([...selfiesTitles.slice(0, -1), selfies, ''])
    setSmiles('');
    setSelfies('[nop]');
    rnn.resetStates();
    setRnnX(rnn.selfie2vec('[nop]'))
  }

  const translateKey = (k) => {
    let t = rnnMod.model(rnnX);
    setRnnX(rnnMod.sample(t));
    rnnMod.vec2selfie(rnnX).then((v) => {
      setSelfies(selfies + v.join(''));
      const s = selfies_mod.selfies2smiles(selfies);
      setSmiles(s);
    });
  }

  useEffect(() => {
    updateSmiles(smiles, cardArray[titles.length - 1].props.canvas_id, smilesDrawer);
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Typography align="center" variant="h2" component="h2" gutterBottom>
          Molecule Dream
        </Typography>
        <Typography align="left" variant="body1" component="p" gutterBottom>
          Smash 🔨 the keyboard ⌨️ as fast as you can to dream up new molecules
        </Typography>
        <TextField variant='outlined' fullWidth value={smiles}
          //onChange={(e) => setSmiles(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter')
              finalizeCard();
            else
              translateKey(e)
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button color="secondary" onClick={finalizeCard}>✍️</Button>
              </InputAdornment>
            ),
          }} />
      </Container>
      <div className={classes.root}>
        <br />
        <Grid container spacing={3}>
          {gCardArray.reverse()}
          <Grid className={classes.item} item xs={2}>
            <Card variant="elevation">
              <CardContent>
                <Typography align="left" variant="body2" component="p" gutterBottom>
                  Wait 5-30 seconds for things to load. Just hit buttons until it works. <br />This package is very inefficient - you may find your memory usage skyrocketing or even
                  memory errors occurring in your tab if you run this. This is because garbage collection
                  isn't being triggered correctly. Just close and re-open the tab when this happens.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div >
    </ThemeProvider>
  );
}

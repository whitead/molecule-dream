
import { Divider, CssBaseline, ThemeProvider, Container, Grid, Button, CardActions, Paper, TextField, Typography } from '@material-ui/core'
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
  const [smiles, setSmiles] = useState('[C][C]');
  const [rnnState, setRnnState] = useState(rnn.init_s());
  const [rnnX, setRnnX] = useState(rnn.selfie2vec('[nop]'));
  const [selfies, setSelfies] = useState('[nop]');

  let cardArray = titles.map((e, i) => {
    return (<MolCard fixedTitle={e} title={i === titles.length - 1 ? smiles : ''} canvas_id={`test_${i}`} ></MolCard >);
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
    setSmiles('');
    setSelfies('[nop]');
    setRnnState(rnn.init_s());
    setRnnX(rnn.selfie2vec('[nop]'))
  }

  const translateKey = (k) => {
    let t = rnnMod.model(rnnX, rnnState);
    setRnnX(rnnMod.sample(t[0]));
    setRnnState(t[1]);
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
          Important Message
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
        </Grid>
      </div >
    </ThemeProvider>
  );
}


import { Card, CardContent, CssBaseline, ThemeProvider, Container, Grid, Button, TextField, Typography } from '@material-ui/core'
import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
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

const renderLoadStatus = (s) => {
  if(s === 'loaded')
    return <CircularProgress variant="determinate" value={100} />
  else if(s === 'loading')
    return <CircularProgress  color="secondary" />
  else if(s === 'failed')
    return <Typography color="error">Failed</Typography>
  //return <CircularProgress  value={0} variant="determinate" color="inherit" />
}

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
  const [rnnLoaded, setRnnLoaded] = useState('waiting');
  const [selfiesLoaded, setSelfiesLoaded] = useState('waiting');
  const [pyodideLoaded, setPyodideLoaded] = useState('waiting');
  const [smilesLoaded, setSmilesLoaded] = useState('loaded');


  //TODO put these in useffect so they are not called each render.
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
    updateSmiles(smiles, cardArray[titles.length - 1].props.canvas_id, smilesDrawer);
    setSelfies('[nop]');
    rnn.resetStates();
    setRnnX(rnn.selfie2vec('[nop]'))
  }

  const translateKey = (k) => {
    let t = rnnMod.model(rnnX);
    setRnnX(rnnMod.sample(t, k.keyCode));
    rnnMod.vec2selfie(rnnX).then((v) => {
      setSelfies(selfies + v.join(''));
      const s = selfies_mod.selfies2smiles(selfies);
      setSmiles(s);
      // not sure how to put these functions into useEffect, so do it here
      updateSmiles(smiles, cardArray[titles.length - 1].props.canvas_id, smilesDrawer);
    });
  }

  useEffect(() => {
    if(rnnLoaded === 'waiting')
      setRnnLoaded(rnn.startLoad((x) => setRnnLoaded(x)));
    if(rnnLoaded === 'loaded'){
      if(pyodideLoaded === 'waiting') {
        // pass any function which will trigger re-render
        selfies_mod.startLoad(
          (x) => setPyodideLoaded(x),
          (x) => setSelfiesLoaded(x)
        );
        setPyodideLoaded('loading')
      }
      else {
        setPyodideLoaded(selfies_mod.pyoded_loaded);
        setSelfiesLoaded(selfies_mod.selfies_loaded);
      }
    }
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
        <TextField variant='outlined' disabled={!(rnnLoaded && selfiesLoaded && pyodideLoaded && smilesLoaded)} fullWidth value={smiles}
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
            )
          }} />
      </Container>
      <div className={classes.root}>
        <br />
        <Grid container spacing={3}>
          {gCardArray.reverse()}
          <Grid className={classes.item} item xs={2}>
            <Card variant="elevation">
              <CardContent>
                <Typography color="textSecondary" className={classes.title} gutterBottom>
                  Instructions
                </Typography>
                <Typography align="left" variant="body2" component="p" gutterBottom>
                  Wait 5-30 seconds for things to load. Just hit buttons until it works. <br />This package is very inefficient - you may find your memory usage skyrocketing or even
                  memory errors occurring in your tab if you run this. This is because garbage collection
                  isn't being triggered correctly. Just close and re-open the tab when this happens.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid className={classes.item} item xs={2}>
            <Card variant="elevation">
              <CardContent>
                <List>
                <ListItem>
                    <ListItemText primary="SMILES Drawer" />
                    {renderLoadStatus(smilesLoaded)}
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="RNN Model" />
                    {renderLoadStatus(rnnLoaded)}
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Pyodide" />
                    {renderLoadStatus(pyodideLoaded)}
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Selfies" />
                    {renderLoadStatus(selfiesLoaded)}
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div >
    </ThemeProvider>
  );
}

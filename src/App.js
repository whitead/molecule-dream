
import { IconButton, Slide, Card, CardContent, CssBaseline, ThemeProvider, Container, Grid, Button, TextField, Typography, ButtonGroup } from '@material-ui/core'
import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InputAdornment from '@material-ui/core/InputAdornment';
import React, { useState, useEffect } from 'react';
import { makeStyles, createTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import SmilesDrawer from 'smiles-drawer';
import MolCard from './components/MolCard';
import rnn from './lib/rnn';
import rnnMod from './lib/rnn';
import { startSelfiesWorker, selfiesLoadStatus, selfies2smiles } from './lib/selfies';

const theme = createTheme({
  palette: {
    type: 'dark',
  },
  overrides: {
    MuiGrid: {
      'spacing-xs-3': {
        color: 'purple',
        width: 'unset',
        margin: 'unset'
      },
    }
  }
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  item: {
    // margin: '12px'
  },
  title: {
    fontSize: 18,
  },
  formContainer: {
    display: 'flex'
  },
  textField: {
    // making pixel perfect
    [theme.breakpoints.down('xs')]: {
      width: '250px',
    },
    width: '439px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '0px'
    }
  },
  linearPRoot: {
    height: '1.5rem',
    marginTop: '0.25rem',
  },
  iconButton: {
    border: '#606060 1px solid',
    '&:hover': {
      borderColor: 'white'
    },
    borderRadius: '0px',
    height: '56px',
    width: '56px',
    marginRight: '1px'
  },
  inputForm: {
    margin: 'auto'
  },
  flexCont: {
    display: 'flex',
    justifyContent: 'center'
  }
}));

const renderLoadStatus = (s) => {
  if (s === 'loaded')
    return <Typography color="textSecondary">Done</Typography>
  else if (s === 'waiting')
    return <CircularProgress value={100} variant="determinate" color="inherit" />
  else if (s === 'failed')
    return <Typography color="error">Failed</Typography>
  // loading...
  return <CircularProgress color="secondary" />
}

export default function App(props) {
  const classes = useStyles();
  const mdQuery = useMediaQuery(theme.breakpoints.up('md'));

  const [titles, setTitles] = useState(Array.from({ length: 1 }, (e, i) => ''))
  const [selfiesTitles, setSelfiesTitles] = useState(Array.from({ length: 1 }, (e, i) => ''))
  const [smiles, setSmiles] = useState('');
  const [rnnX, setRnnX] = useState(rnn.selfie2vec('[nop]'));
  const [selfies, setSelfies] = useState('');
  const [rnnLoaded, setRnnLoaded] = useState('waiting');
  const [selfiesLoaded, setSelfiesLoaded] = useState('waiting');
  const [pyodideLoaded, setPyodideLoaded] = useState('waiting');
  const [smilesLoaded, setSmilesLoaded] = useState('loaded');
  const options = { width: mdQuery ? '400' : '250', height: mdQuery ? '300' : '200' };
  const smilesDrawer = new SmilesDrawer.Drawer(options);


  const updateSmiles = (s, canvas_id, drawer, palette = 'light') => {
    SmilesDrawer.parse(s, (tree) => {
      drawer.draw(tree, canvas_id, palette);
    }, (err) => {
    });
  }

  const ready = () => {
    return rnnLoaded === 'loaded' &&
      selfiesLoaded === 'loaded' &&
      pyodideLoaded === 'loaded' &&
      smilesLoaded === 'loaded'
  }


  //TODO put these in useffect so they are not called each render.?
  let cardArray = titles.map((e, i) => {
    return (<MolCard fixedTitle={e}
      canvas={options}
      selfies={selfiesTitles[i]} title={i === titles.length - 1 ? smiles : ''}
      canvas_id={`test_${i}`} ></MolCard >);
  });
  let gCardArray = cardArray.map((c, i) => {
    return (
      <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
        {c}
      </Grid>
    );
  });

  const translateKey = (k) => {
    let t = rnnMod.model(rnnX);
    setRnnX(rnnMod.sample(t, k.keyCode));
    rnnMod.vec2selfie(rnnX).then((v) => {
      setSelfies(selfies + v.join(''));
      // not sure how to put these functions into useEffect, so do it here
    });
  }

  const sampleWholeMol = () => {
    const l = Math.floor(Math.random() * 100);
    const s = ['[nop]'];
    let x = rnn.selfie2vec('[nop]');
    let t = rnnMod.model(x);
    let ps = []

    for (let i = 0; i < l; i++) {
      x = rnnMod.sample(t);
      ps.push(rnnMod.vec2selfie(x));
      t = rnnMod.model(x);
    }
    return Promise.all(ps).then((result) => {
      return result.join('');
    })
  }

  const finalizeCard = () => {
    // check for empty
    if (selfies.length === 0) {
      return;
    }
    // change palette for final
    updateSmiles(smiles, cardArray[titles.length - 1].props.canvas_id, smilesDrawer, 'dark');
    // add space so it evals to true
    setTitles([...titles.slice(0, -1), smiles + ' ', ''])
    // slice to remove noop
    setSelfiesTitles([...selfiesTitles.slice(0, -1), selfies, ''])
    setSmiles('');
    setSelfies('');
    rnn.resetStates();
    setRnnX(rnn.selfie2vec('[nop]'))
  }

  useEffect(() => {
    selfies2smiles(selfies).then((s) => {
      setSmiles(s)
      updateSmiles(s, cardArray[titles.length - 1].props.canvas_id, smilesDrawer);
    });
  }, [selfies]);


  useEffect(() => {
    if (rnnLoaded === 'waiting')
      setRnnLoaded(rnn.startLoad((x) => setRnnLoaded(x)));
    if (rnnLoaded === 'loaded') {
      if (pyodideLoaded === 'waiting') {
        // pass any function which will trigger re-render
        startSelfiesWorker()
      }
      selfiesLoadStatus().then((s) => {
        setPyodideLoaded(s.pyodide);
        setSelfiesLoaded(s.selfies);
      })
    }
    // just keep checking with timeout
    if (selfiesLoaded === 'loading') {
      selfiesLoadStatus().then((s) => {
        setPyodideLoaded(s.pyodide);
        setSelfiesLoaded(s.selfies);
        if (s.selfies === 'loading') {
          setTimeout(() => setPyodideLoaded('loading...'), 500);
        }
      })
    }
  }, [rnnLoaded, pyodideLoaded, selfiesLoaded, smilesLoaded]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Typography align="center" variant="h2" component="h2" gutterBottom>
          Molecule Dream
        </Typography>
        <Typography align="left" variant="body1" component="p" gutterBottom>
          Smash 🔨 the keyboard ⌨️ as fast as you can to dream up new molecules
        </Typography>
        <div className={classes.flexCont}>
          <TextField variant='outlined' disabled={!ready()} value={selfies}
            //onChange={(e) => setSmiles(e.target.value)}
            className={classes.textField}
            onKeyDown={(e) => {
              if (e.key === 'Enter')
                finalizeCard();
              else
                translateKey(e)
            }} />
          <ButtonGroup>
            <IconButton aria-label="finalize molecule" className={classes.iconButton} color="secondary" onClick={finalizeCard}>✍️</IconButton>
            <IconButton className={classes.iconButton} color="secondary" aria-label="generate random molecule"
              onClick={() => sampleWholeMol().then((s) => setSelfies(s))}
            >🤛</IconButton>
          </ButtonGroup>
        </div>
        <div>
          <LinearProgress
            className={classes.linearPRoot}
            color="secondary"
            variant="determinate"
            value={titles.length * 5}
          />
        </div>

      </Container>
      <div className={classes.root}>
        <br />
        <Grid container spacing={3}>
          <Slide direction="up" in={!ready()} unmountOnExit>
            <Grid item xs={12} sm={6} md={4} lg={3}>
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
          </Slide>
          {gCardArray.reverse()}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card variant="elevation">
              <CardContent>
                <Typography color="textSecondary" className={classes.title} gutterBottom>
                  Instructions
                </Typography>
                <Typography align="left" variant="body2" component="p" gutterBottom>
                  Wait 5-30 seconds for things to load. If it fails, try to use a new tab to free memory. This package is very inefficient - you may find your memory usage skyrocketing or even
                  memory errors occurring in your tab if you run this. This is because garbage collection
                  isn't being triggered correctly. Just close and re-open the tab when this happens.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div >
    </ThemeProvider >
  );
}

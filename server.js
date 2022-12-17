import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 3000;
const app = express();

const server = app.listen(port, async () => {
    console.log(`Assignment 1 app listening on port ${port}!`);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'client')));


app.get('/', async (req, res) => {

    res.render('index', {

        title:'Home'
    });
});

app.get('/about', async (req, res) => {

    res.render('about', {

        title:'About'
    });
});

app.get('/contact', async (req, res) => {
    res.render('contact', {

        title:'Contact'
    });
});

app.get('/portfolio', async (req, res) => {
    res.render('portfolio', {
        title:'Portfolio'
    });
});


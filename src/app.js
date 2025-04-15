const express = require('express');
const cors = require('cors');
const voteRoutes = require('./routes/voteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vote', voteRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Tab,
  Tabs,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001/api' 
  : 'https://echo-ai-chat-server.onrender.com/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TrainingDashboard({ siteId, siteName }) {
  const [activeTab, setActiveTab] = useState(0);
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    question: '',
    answer: '',
    keywords: '',
    category: 'general',
    confidence: 1.0
  });
  const [siteSettings, setSiteSettings] = useState({
    customTraining: {
      systemPrompt: '',
      personality: 'helpful and professional',
      responseStyle: 'conversational',
      businessContext: '',
      restrictions: ''
    },
    features: {
      leadCapture: false,
      appointmentBooking: false,
      multilingual: false,
      sentiment: false,
      analytics: true
    }
  });
  const [bulkImportText, setBulkImportText] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (siteId) {
      loadTrainingData();
      loadSiteSettings();
      loadStats();
    }
  }, [siteId]);

  const loadTrainingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/training/${siteId}`);
      const data = await response.json();
      setTrainingData(data.data || []);
    } catch (error) {
      console.error('Failed to load training data:', error);
    }
    setLoading(false);
  };

  const loadSiteSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/config?siteId=${siteId}`);
      const data = await response.json();
      setSiteSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load site settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/training/${siteId}`);
      const data = await response.json();
      
      const typeStats = data.data?.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}) || {};
      
      setStats({
        total: data.total || 0,
        byType: typeStats,
        categories: [...new Set(data.data?.map(item => item.category) || [])]
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSaveItem = async () => {
    try {
      const payload = {
        ...newItem,
        keywords: newItem.keywords.split(',').map(k => k.trim()).filter(k => k),
        siteId
      };

      const url = editingItem 
        ? `${API_BASE}/training/${editingItem._id}`
        : `${API_BASE}/training/qa`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setOpenDialog(false);
        setEditingItem(null);
        setNewItem({
          question: '',
          answer: '',
          keywords: '',
          category: 'general',
          confidence: 1.0
        });
        loadTrainingData();
        loadStats();
      }
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training item?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/training/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadTrainingData();
        loadStats();
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleBulkImport = async () => {
    try {
      const lines = bulkImportText.split('\n').filter(line => line.trim());
      const trainingItems = [];
      
      for (const line of lines) {
        const [question, answer, keywords = '', category = 'general'] = line.split('|').map(s => s.trim());
        if (question && answer) {
          trainingItems.push({
            type: 'qa_pair',
            question,
            answer,
            keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
            category,
            confidence: 1.0
          });
        }
      }
      
      if (trainingItems.length > 0) {
        const response = await fetch(`${API_BASE}/training/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId, trainingItems })
        });
        
        if (response.ok) {
          setBulkImportText('');
          loadTrainingData();
          loadStats();
          alert(`Successfully imported ${trainingItems.length} items!`);
        }
      }
    } catch (error) {
      console.error('Bulk import failed:', error);
      alert('Bulk import failed. Please check the format.');
    }
  };

  const handleSiteSettingsUpdate = async () => {
    try {
      const response = await fetch(`${API_BASE}/site/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          customTraining: siteSettings.customTraining,
          features: siteSettings.features
        })
      });
      
      if (response.ok) {
        alert('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings.');
    }
  };

  const exportTrainingData = () => {
    const csv = trainingData.map(item => 
      `"${item.question}","${item.answer}","${item.keywords?.join(', ') || ''}","${item.category}"`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteName || 'chatbot'}-training-data.csv`;
    a.click();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chatbot Training Dashboard - {siteName}
      </Typography>
      
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Training Items
              </Typography>
              <Typography variant="h5">
                {stats.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Q&A Pairs
              </Typography>
              <Typography variant="h5">
                {stats.byType?.qa_pair || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Custom Responses
              </Typography>
              <Typography variant="h5">
                {stats.byType?.custom_response || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categories
              </Typography>
              <Typography variant="h5">
                {stats.categories?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Training Data" />
          <Tab label="Bot Personality" />
          <Tab label="Features" />
          <Tab label="Bulk Import" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Training Data Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add Q&A Pair
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportTrainingData}
            >
              Export Data
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Answer</TableCell>
                    <TableCell>Keywords</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainingData.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.question}</TableCell>
                      <TableCell>{item.answer?.substring(0, 100)}...</TableCell>
                      <TableCell>
                        {item.keywords?.map((keyword, i) => (
                          <Chip key={i} label={keyword} size="small" sx={{ mr: 0.5 }} />
                        ))}
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.confidence}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => {
                            setEditingItem(item);
                            setNewItem({
                              question: item.question,
                              answer: item.answer,
                              keywords: item.keywords?.join(', ') || '',
                              category: item.category,
                              confidence: item.confidence
                            });
                            setOpenDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteItem(item._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Bot Personality Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="System Prompt"
                multiline
                rows={4}
                value={siteSettings.customTraining?.systemPrompt || ''}
                onChange={(e) => setSiteSettings(prev => ({
                  ...prev,
                  customTraining: {
                    ...prev.customTraining,
                    systemPrompt: e.target.value
                  }
                }))}
                helperText="Define how your chatbot should behave and respond"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Personality"
                value={siteSettings.customTraining?.personality || ''}
                onChange={(e) => setSiteSettings(prev => ({
                  ...prev,
                  customTraining: {
                    ...prev.customTraining,
                    personality: e.target.value
                  }
                }))}
                helperText="e.g., friendly, professional, casual"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Response Style"
                value={siteSettings.customTraining?.responseStyle || ''}
                onChange={(e) => setSiteSettings(prev => ({
                  ...prev,
                  customTraining: {
                    ...prev.customTraining,
                    responseStyle: e.target.value
                  }
                }))}
                helperText="e.g., conversational, formal, concise"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Context"
                multiline
                rows={3}
                value={siteSettings.customTraining?.businessContext || ''}
                onChange={(e) => setSiteSettings(prev => ({
                  ...prev,
                  customTraining: {
                    ...prev.customTraining,
                    businessContext: e.target.value
                  }
                }))}
                helperText="Describe your business, products, or services"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Restrictions"
                multiline
                rows={2}
                value={siteSettings.customTraining?.restrictions || ''}
                onChange={(e) => setSiteSettings(prev => ({
                  ...prev,
                  customTraining: {
                    ...prev.customTraining,
                    restrictions: e.target.value
                  }
                }))}
                helperText="What topics should the bot avoid or limitations to set"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleSiteSettingsUpdate}
                size="large"
              >
                Save Personality Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Features Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Chatbot Features
          </Typography>
          {/* Feature toggles would go here */}
          <Alert severity="info">
            Feature configuration panel coming soon! This will allow you to enable/disable 
            lead capture, appointment booking, multilingual support, and more.
          </Alert>
        </TabPanel>

        {/* Bulk Import Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Bulk Import Training Data
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            Format: Question | Answer | Keywords (comma-separated) | Category
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            placeholder="What is your return policy? | We offer 30-day returns on all items | return,policy,refund | support
How do I track my order? | You can track your order using the tracking number sent to your email | tracking,order,shipment | support"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleBulkImport}
            disabled={!bulkImportText.trim()}
          >
            Import Training Data
          </Button>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Training Analytics
          </Typography>
          <Alert severity="info">
            Advanced analytics coming soon! This will show conversation success rates, 
            most asked questions, training gaps, and AI-powered improvement suggestions.
          </Alert>
        </TabPanel>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Training Item' : 'Add New Q&A Pair'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Question"
                value={newItem.question}
                onChange={(e) => setNewItem(prev => ({ ...prev, question: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Answer"
                multiline
                rows={4}
                value={newItem.answer}
                onChange={(e) => setNewItem(prev => ({ ...prev, answer: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Keywords (comma-separated)"
                value={newItem.keywords}
                onChange={(e) => setNewItem(prev => ({ ...prev, keywords: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="technical">Technical</MenuItem>
                  <MenuItem value="billing">Billing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained">
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

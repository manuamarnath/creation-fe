import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Always use Render API since backend is deployed there
const API_BASE = 'https://hybrid-chat-be.onrender.com/api';

export default function Training({ clients = [] }) {
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [selectedSiteName, setSelectedSiteName] = useState('');
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newQA, setNewQA] = useState({
    question: '',
    answer: '',
    category: 'general'
  });

  // Load training data when site is selected
  useEffect(() => {
    if (selectedSiteId) {
      loadTrainingData();
    }
  }, [selectedSiteId]);

  const loadTrainingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/training/${selectedSiteId}`);
      if (response.ok) {
        const data = await response.json();
        setTrainingData(data.data || []);
        setStatus(`Loaded ${data.data?.length || 0} training items`);
      } else {
        setStatus('Failed to load training data');
      }
    } catch (error) {
      console.error('Failed to load training data:', error);
      setStatus('Error loading training data');
    }
    setLoading(false);
  };

  const handleSiteChange = (event) => {
    const siteId = event.target.value;
    setSelectedSiteId(siteId);
    
    // Find the selected client and site name
    for (const client of clients) {
      if (client.sites && client.sites.length > 0) {
        const site = client.sites.find(s => s._id === siteId);
        if (site) {
          setSelectedSiteName(site.domain || client.email);
          break;
        }
      }
    }
  };

  const handleSaveQA = async () => {
    if (!newQA.question.trim() || !newQA.answer.trim()) {
      setStatus('Please enter both question and answer');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        siteId: selectedSiteId,
        question: newQA.question,
        answer: newQA.answer,
        keywords: newQA.question.toLowerCase().split(' ').filter(word => word.length > 2),
        category: newQA.category,
        confidence: 1.0,
        type: 'qa_pair'
      };

      const url = editingItem 
        ? `${API_BASE}/training/${editingItem._id}`
        : `${API_BASE}/training/qa`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus(editingItem ? 'Q&A updated successfully!' : 'Q&A added successfully!');
        setNewQA({ question: '', answer: '', category: 'general' });
        setOpenDialog(false);
        setEditingItem(null);
        loadTrainingData(); // Refresh the list
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        setStatus(`Failed to save: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      setStatus(`Network error: ${error.message}. Check if backend is running.`);
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewQA({
      question: item.question || '',
      answer: item.answer || '',
      category: item.category || 'general'
    });
    setOpenDialog(true);
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this Q&A pair?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/training/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStatus('Q&A deleted successfully!');
        loadTrainingData(); // Refresh the list
      } else {
        setStatus('Failed to delete Q&A');
      }
    } catch (error) {
      console.error('Error deleting Q&A:', error);
      setStatus('Network error while deleting');
    }
    setLoading(false);
  };

  const handleOpenDialog = () => {
    setEditingItem(null);
    setNewQA({ question: '', answer: '', category: 'general' });
    setOpenDialog(true);
  };

  const getAlertSeverity = () => {
    if (status.includes('successfully') || status.includes('Loaded')) return 'success';
    if (status.includes('Failed') || status.includes('Error') || status.includes('Network error')) return 'error';
    return 'info';
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 2 } }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          color: '#667eea',
          mb: 3
        }}
      >
        Chatbot Training - Q&A Management
      </Typography>

      {/* Site Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Select Site to Train</InputLabel>
            <Select
              value={selectedSiteId}
              onChange={handleSiteChange}
              label="Select Site to Train"
            >
              {clients.map((client) => 
                client.sites?.map((site) => (
                  <MenuItem key={site._id} value={site._id}>
                    {site.domain} ({client.email})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          
          {selectedSiteName && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Training chatbot for: <strong>{selectedSiteName}</strong>
            </Typography>
          )}
        </CardContent>
      </Card>

      {selectedSiteId && (
        <Fade in timeout={500}>
          <Box>
            {/* Add New Q&A Button */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Training Data ({trainingData.length} items)
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                Add Q&A
              </Button>
            </Box>

            {/* Training Data Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Question</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Answer</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainingData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography color="text.secondary">
                            No training data yet. Add your first Q&A pair to get started!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      trainingData.map((item) => (
                        <TableRow key={item._id} hover>
                          <TableCell sx={{ maxWidth: 300 }}>
                            <Typography variant="body2" sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {item.question}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 400 }}>
                            <Typography variant="body2" sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {item.answer}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={item.category || 'general'} 
                              size="small"
                              sx={{ backgroundColor: '#e3f2fd' }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(item)}
                              sx={{ color: '#667eea', mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(item._id)}
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Fade>
      )}

      {/* Add/Edit Q&A Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingItem ? 'Edit Q&A Pair' : 'Add New Q&A Pair'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Question"
              multiline
              rows={2}
              value={newQA.question}
              onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
              margin="normal"
              placeholder="What question will users ask?"
            />
            
            <TextField
              fullWidth
              label="Answer"
              multiline
              rows={4}
              value={newQA.answer}
              onChange={(e) => setNewQA({ ...newQA, answer: e.target.value })}
              margin="normal"
              placeholder="How should the chatbot respond?"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={newQA.category}
                onChange={(e) => setNewQA({ ...newQA, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="product">Product</MenuItem>
                <MenuItem value="support">Support</MenuItem>
                <MenuItem value="billing">Billing</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveQA}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            {loading ? <CircularProgress size={20} /> : (editingItem ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Alert */}
      {status && (
        <Fade in timeout={300}>
          <Alert
            severity={getAlertSeverity()}
            sx={{ 
              mt: 2,
              '& .MuiAlert-message': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
            onClose={() => setStatus('')}
          >
            {status}
          </Alert>
        </Fade>
      )}
    </Box>
  );
}

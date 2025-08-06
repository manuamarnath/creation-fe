import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
  Fade,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from "@mui/material";
import { Delete as DeleteIcon, Visibility as ViewIcon, Settings as SettingsIcon } from "@mui/icons-material";
import TrainingDashboard from './TrainingDashboard.jsx';
import Training from './Training.jsx';

export default function ClientCreation() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, client: null });
  const [selectedClient, setSelectedClient] = useState(null);

  // Fetch existing clients
  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await fetch("https://hybrid-chat-be.onrender.com/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoadingClients(false);
    }
  };

  // Delete client
  const handleDeleteClient = async (clientId) => {
    try {
      const res = await fetch(`https://hybrid-chat-be.onrender.com/api/clients/${clientId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setClients(clients.filter(client => client._id !== clientId));
        setStatus("Client deleted successfully");
      } else {
        setStatus("Failed to delete client");
      }
    } catch (err) {
      setStatus("Network error while deleting client");
    }
    setDeleteDialog({ open: false, client: null });
  };

  useEffect(() => {
    if (tabValue === 1) {
      fetchClients();
    }
  }, [tabValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Creating client...");
    try {
      const res = await fetch("https://hybrid-chat-be.onrender.com/api/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, domain })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Client created! Site ID: ${data.siteId}`);
        setEmail("");
        setPassword("");
        setDomain("");
        // Refresh clients list if we're on the manage tab
        if (tabValue === 1) {
          fetchClients();
        }
      } else {
        setStatus(data.error || "Failed to create client");
      }
    } catch (err) {
      setStatus("Network error");
    } finally {
      setLoading(false);
    }
  };

  const getAlertSeverity = () => {
    if (status.includes("Client created!")) return "success";
    if (status.includes("Creating client...")) return "info";
    if (status.includes("Failed") || status.includes("Network error")) return "error";
    return "info";
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box
        sx={{
          minHeight: "100vh",
          py: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Fade in timeout={800}>
          <Paper
            elevation={12}
            sx={{
              borderRadius: { xs: 2, sm: 3, md: 4 },
              overflow: "hidden",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              p: 0.3,
              mx: { xs: 0, sm: 1, md: 2 },
            }}
          >
            <Card
              sx={{
                borderRadius: { xs: 1.7, sm: 2.7, md: 3.7 },
                background: "#ffffff",
                minWidth: { xs: "100%", sm: 400, md: 600 },
                maxWidth: "100%",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box textAlign="center" mb={{ xs: 2, sm: 3 }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    fontWeight="bold"
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    }}
                  >
                    Client Management
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    mt={1}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Create new clients or manage existing ones
                  </Typography>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 2, sm: 3 } }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={(e, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        minHeight: { xs: 40, sm: 48 },
                      },
                      "& .Mui-selected": {
                        color: "#667eea !important",
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#667eea",
                      },
                      "& .MuiTabs-flexContainer": {
                        justifyContent: { xs: "flex-start", sm: "center" },
                      },
                    }}
                  >
                    <Tab label="Create New Client" />
                    <Tab label="Manage Clients" />
                    <Tab label="Train Chatbots" />
                    <Tab label="Direct Q&A Training" />
                  </Tabs>
                </Box>

                {tabValue === 0 && (
                  <Box 
                    component="form" 
                    onSubmit={handleSubmit} 
                    sx={{ 
                      mt: { xs: 2, sm: 3 },
                      maxWidth: { xs: "100%", sm: 500 },
                      mx: "auto"
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      variant="outlined"
                      margin="normal"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          height: { xs: "40px", sm: "56px" },
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          "&.Mui-focused": {
                            color: "#667eea",
                          },
                        },
                        "& .MuiInputBase-input": {
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      variant="outlined"
                      margin="normal"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          height: { xs: "40px", sm: "56px" },
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          "&.Mui-focused": {
                            color: "#667eea",
                          },
                        },
                        "& .MuiInputBase-input": {
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Domain"
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      required
                      variant="outlined"
                      margin="normal"
                      placeholder="example.com"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          height: { xs: "40px", sm: "56px" },
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          "&.Mui-focused": {
                            color: "#667eea",
                          },
                        },
                        "& .MuiInputBase-input": {
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        mt: { xs: 2, sm: 3 },
                        mb: 2,
                        py: { xs: 1, sm: 1.5 },
                        height: { xs: "40px", sm: "48px" },
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        boxShadow: "0 4px 15px 0 rgba(102, 126, 234, 0.4)",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        "&:hover": {
                          background: "linear-gradient(135deg, #5a67d8 0%, #6b46a3 100%)",
                          boxShadow: "0 6px 20px 0 rgba(102, 126, 234, 0.6)",
                          transform: "translateY(-2px)",
                        },
                        "&:disabled": {
                          background: "rgba(0, 0, 0, 0.12)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {loading ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <CircularProgress size={20} color="inherit" />
                          Creating Client...
                        </Box>
                      ) : (
                        "Create Client"
                      )}
                    </Button>
                  </Box>
                )}

                {tabValue === 1 && (
                  <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                    {loadingClients ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <TableContainer 
                        component={Paper} 
                        elevation={0} 
                        sx={{ 
                          border: 1, 
                          borderColor: 'divider',
                          overflowX: 'auto',
                          '& .MuiTable-root': {
                            minWidth: { xs: 650, sm: 'auto' }
                          }
                        }}
                      >
                        <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                px: { xs: 1, sm: 2 }
                              }}>
                                Email
                              </TableCell>
                              <TableCell sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                px: { xs: 1, sm: 2 },
                                display: { xs: 'none', sm: 'table-cell' }
                              }}>
                                Domain
                              </TableCell>
                              <TableCell sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                px: { xs: 1, sm: 2 },
                                display: { xs: 'none', md: 'table-cell' }
                              }}>
                                Site ID
                              </TableCell>
                              <TableCell sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                px: { xs: 1, sm: 2 },
                                display: { xs: 'none', sm: 'table-cell' }
                              }}>
                                Status
                              </TableCell>
                              <TableCell 
                                align="center" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  px: { xs: 1, sm: 2 }
                                }}
                              >
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {clients.length === 0 ? (
                              <TableRow>
                                <TableCell 
                                  colSpan={5}
                                  align="center" 
                                  sx={{ py: { xs: 2, sm: 4 } }}
                                >
                                  <Typography 
                                    color="text.secondary"
                                    fontSize={{ xs: "0.875rem", sm: "1rem" }}
                                  >
                                    No clients found
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              clients.map((client) => (
                                <TableRow key={client._id} hover>
                                  <TableCell sx={{ 
                                    px: { xs: 1, sm: 2 },
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" }
                                  }}>
                                    <Box>
                                      <Typography variant="body2" noWrap>
                                        {client.email}
                                      </Typography>
                                      {/* Show domain and status on mobile */}
                                      <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          {client.sites?.[0]?.domain || 'N/A'}
                                        </Typography>
                                        <Chip 
                                          label="Active" 
                                          size="small" 
                                          color="success" 
                                          variant="outlined"
                                          sx={{ ml: 1, height: 16, fontSize: '0.625rem' }}
                                        />
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ 
                                    px: { xs: 1, sm: 2 },
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    display: { xs: 'none', sm: 'table-cell' }
                                  }}>
                                    {client.sites?.[0]?.domain || 'N/A'}
                                  </TableCell>
                                  <TableCell sx={{ 
                                    px: { xs: 1, sm: 2 },
                                    display: { xs: 'none', md: 'table-cell' }
                                  }}>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontFamily: 'monospace',
                                        fontSize: { xs: "0.625rem", sm: "0.75rem" }
                                      }}
                                    >
                                      {client.sites?.[0]?._id || 'N/A'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ 
                                    px: { xs: 1, sm: 2 },
                                    display: { xs: 'none', sm: 'table-cell' }
                                  }}>
                                    <Chip 
                                      label="Active" 
                                      size="small" 
                                      color="success" 
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell align="center" sx={{ px: { xs: 1, sm: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        title="View Details"
                                        sx={{ 
                                          minWidth: 'auto',
                                          p: { xs: 0.5, sm: 1 }
                                        }}
                                      >
                                        <ViewIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                                      </IconButton>
                                      <IconButton 
                                        size="small" 
                                        color="secondary"
                                        title="Train Chatbot"
                                        onClick={() => {
                                          setSelectedClient(client);
                                          setTabValue(2);
                                        }}
                                        sx={{ 
                                          minWidth: 'auto',
                                          p: { xs: 0.5, sm: 1 }
                                        }}
                                      >
                                        <SettingsIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                                      </IconButton>
                                      <IconButton 
                                        size="small" 
                                        color="error"
                                        title="Delete Client"
                                        onClick={() => setDeleteDialog({ open: true, client })}
                                        sx={{ 
                                          minWidth: 'auto',
                                          p: { xs: 0.5, sm: 1 }
                                        }}
                                      >
                                        <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                                      </IconButton>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {tabValue === 2 && (
                  <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                    {selectedClient ? (
                      <TrainingDashboard 
                        siteId={selectedClient.sites?.[0]?._id}
                        siteName={selectedClient.sites?.[0]?.domain || selectedClient.email}
                      />
                    ) : (
                      <Box textAlign="center" py={4}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Select a Client to Train
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Go to the "Manage Clients" tab and click the settings icon to start training a chatbot.
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => setTabValue(1)}
                          sx={{ mt: 2 }}
                        >
                          View Clients
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}

                {tabValue === 3 && (
                  <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                    <Training clients={clients} />
                  </Box>
                )}

                {status && (
                  <Fade in timeout={300}>
                    <Alert
                      severity={getAlertSeverity()}
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        "& .MuiAlert-icon": {
                          alignItems: "center",
                        },
                      }}
                    >
                      {status}
                    </Alert>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Paper>
        </Fade>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, client: null })}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              mx: { xs: 2, sm: 3 },
              my: { xs: 2, sm: 4 },
              width: { xs: 'calc(100% - 32px)', sm: 'auto' }
            }
          }}
        >
          <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              Are you sure you want to delete the client "{deleteDialog.client?.email}"? 
              This action cannot be undone and will remove all associated data.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
            <Button 
              onClick={() => setDeleteDialog({ open: false, client: null })}
              color="inherit"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleDeleteClient(deleteDialog.client?._id)}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

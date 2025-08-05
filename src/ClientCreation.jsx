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
import { Delete as DeleteIcon, Visibility as ViewIcon } from "@mui/icons-material";

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
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Fade in timeout={800}>
          <Paper
            elevation={12}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              p: 0.3,
            }}
          >
            <Card
              sx={{
                borderRadius: 3.7,
                background: "#ffffff",
                minWidth: 600,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box textAlign="center" mb={3}>
                  <Typography
                    variant="h4"
                    component="h2"
                    fontWeight="bold"
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    Client Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Create new clients or manage existing ones
                  </Typography>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={(e, newValue) => setTabValue(newValue)}
                    centered
                    sx={{
                      "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 600,
                      },
                      "& .Mui-selected": {
                        color: "#667eea !important",
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#667eea",
                      },
                    }}
                  >
                    <Tab label="Create New Client" />
                    <Tab label="Manage Clients" />
                  </Tabs>
                </Box>

                {tabValue === 0 && (
                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#667eea",
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
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#667eea",
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
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#667eea",
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        mt: 3,
                        mb: 2,
                        py: 1.5,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        boxShadow: "0 4px 15px 0 rgba(102, 126, 234, 0.4)",
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
                  <Box sx={{ mt: 3 }}>
                    {loadingClients ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Domain</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Site ID</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {clients.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                  <Typography color="text.secondary">
                                    No clients found
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              clients.map((client) => (
                                <TableRow key={client._id} hover>
                                  <TableCell>{client.email}</TableCell>
                                  <TableCell>{client.sites?.[0]?.domain || 'N/A'}</TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                      {client.sites?.[0]?._id || 'N/A'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label="Active" 
                                      size="small" 
                                      color="success" 
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      title="View Details"
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      title="Delete Client"
                                      onClick={() => setDeleteDialog({ open: true, client })}
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
                )}

                {status && (
                  <Fade in timeout={300}>
                    <Alert
                      severity={getAlertSeverity()}
                      sx={{
                        mt: 2,
                        borderRadius: 2,
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
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the client "{deleteDialog.client?.email}"? 
              This action cannot be undone and will remove all associated data.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
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

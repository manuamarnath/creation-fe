import React, { useState } from "react";
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
  CircularProgress
} from "@mui/material";

export default function ClientCreation() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
                minWidth: 400,
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
                    Create New Client
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Set up a new client account with domain configuration
                  </Typography>
                </Box>

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
      </Box>
    </Container>
  );
}

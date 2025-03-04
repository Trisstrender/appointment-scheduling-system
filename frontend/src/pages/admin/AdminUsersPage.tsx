import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { userService } from '../../api';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/common';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: string;
  active: boolean;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('ALL');
  
  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    userType: 'CLIENT',
    active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (err) {
        setError('Failed to load users. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply filters whenever search term or user type filter changes
    filterUsers();
  }, [searchTerm, userTypeFilter, users]);

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.phoneNumber && user.phoneNumber.toLowerCase().includes(term))
      );
    }

    // Filter by user type
    if (userTypeFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.userType === userTypeFilter);
    }

    setFilteredUsers(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleUserTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setUserTypeFilter(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      userType: user.userType,
      active: user.active,
    });
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleOpenStatusDialog = (user: User) => {
    setSelectedUser(user);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const handleUserTypeChange = (event: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      userType: event.target.value,
    });
  };

  const handleActiveChange = (event: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      active: event.target.value === 'true',
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    // Validate required fields
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleUpdateUser = async () => {
    if (!validateForm() || !selectedUser) {
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      const userData: Partial<User> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        userType: formData.userType as 'CLIENT' | 'PROVIDER' | 'ADMIN',
        active: formData.active,
      };
      
      // Email cannot be changed, so we don't include it
      
      const updatedUser = await userService.updateUser(selectedUser.id, userData);
      
      // Update in local state
      setUsers(
        users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      
      setSuccess('User updated successfully');
      handleCloseEditDialog();
    } catch (err) {
      setError('Failed to update user. Please try again later.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!selectedUser) return;
    
    try {
      const newStatus = !selectedUser.active;
      
      if (newStatus) {
        await userService.activateUser(selectedUser.id);
      } else {
        await userService.deactivateUser(selectedUser.id);
      }
      
      // Update in local state
      const updatedUser = { ...selectedUser, active: newStatus };
      setUsers(
        users.map((u) => (u.id === selectedUser.id ? updatedUser : u))
      );
      
      setSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      handleCloseStatusDialog();
    } catch (err) {
      setError(`Failed to ${selectedUser.active ? 'deactivate' : 'activate'} user. Please try again later.`);
      console.error(err);
      handleCloseStatusDialog();
    }
  };

  const handleAlertClose = () => {
    setSuccess(null);
    setError(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setUserTypeFilter('ALL');
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  // Get current page of users
  const currentUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        
        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Search Users"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel id="user-type-filter-label">User Type</InputLabel>
            <Select
              labelId="user-type-filter-label"
              id="user-type-filter"
              value={userTypeFilter}
              label="User Type"
              onChange={handleUserTypeFilterChange}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="CLIENT">Clients</MenuItem>
              <MenuItem value="PROVIDER">Providers</MenuItem>
              <MenuItem value="ADMIN">Admins</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            onClick={clearFilters}
            disabled={!searchTerm && userTypeFilter === 'ALL'}
          >
            Clear Filters
          </Button>
        </Box>
        
        {/* Success/Error Alerts */}
        <Snackbar open={!!success || !!error} autoHideDuration={6000} onClose={handleAlertClose}>
          <Alert onClose={handleAlertClose} severity={success ? 'success' : 'error'} sx={{ width: '100%' }}>
            {success || error}
          </Alert>
        </Snackbar>
        
        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No users found matching your criteria.
            </Typography>
            {(searchTerm || userTypeFilter !== 'ALL') && (
              <Button variant="text" color="primary" onClick={clearFilters} sx={{ mt: 2 }}>
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.userType}
                          color={
                            user.userType === 'ADMIN'
                              ? 'secondary'
                              : user.userType === 'PROVIDER'
                              ? 'primary'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.active ? 'Active' : 'Inactive'}
                          color={user.active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(user)}
                          aria-label="edit user"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color={user.active ? 'error' : 'success'}
                          onClick={() => handleOpenStatusDialog(user)}
                          aria-label={user.active ? 'deactivate user' : 'activate user'}
                          size="small"
                        >
                          {user.active ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                value={formData.email}
                disabled // Email cannot be changed
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="phoneNumber"
                name="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="user-type-label">User Type</InputLabel>
                <Select
                  labelId="user-type-label"
                  id="userType"
                  value={formData.userType}
                  label="User Type"
                  onChange={handleUserTypeChange}
                >
                  <MenuItem value="CLIENT">Client</MenuItem>
                  <MenuItem value="PROVIDER">Provider</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="active-label">Status</InputLabel>
                <Select
                  labelId="active-label"
                  id="active"
                  value={formData.active.toString()}
                  label="Status"
                  onChange={handleActiveChange}
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>
          {selectedUser?.active ? 'Deactivate' : 'Activate'} User
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {selectedUser?.active ? 'deactivate' : 'activate'} the user{' '}
            <strong>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </strong>
            ?
            {selectedUser?.active
              ? ' Deactivated users will not be able to log in or use the system.'
              : ' This will restore the user\'s access to the system.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button
            onClick={handleToggleUserStatus}
            variant="contained"
            color={selectedUser?.active ? 'error' : 'success'}
          >
            {selectedUser?.active ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsersPage;
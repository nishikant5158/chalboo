import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { LogOut, Home, Users, Plus } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1
            className="text-2xl font-heading font-bold text-primary cursor-pointer"
            onClick={() => navigate('/dashboard')}
            data-testid="navbar-logo"
          >
            Chalboo
          </h1>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              data-testid="nav-dashboard-btn"
            >
              <Home className="w-5 h-5 mr-2" />
              Discover
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/my-groups')}
              data-testid="nav-my-groups-btn"
            >
              <Users className="w-5 h-5 mr-2" />
              My Groups
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/create-group')}
              data-testid="nav-create-btn"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create
            </Button>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
              <span className="text-sm font-semibold" data-testid="navbar-user-name">{user?.name}</span>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="nav-logout-btn"
                className="border-2 rounded-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
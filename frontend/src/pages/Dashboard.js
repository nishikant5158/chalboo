import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Search, Plus, MapPin, Calendar, Users } from 'lucide-react';
import Navbar from '../components/Navbar';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();
  const [groups, setGroups] = useState([]);
  const [searchParams, setSearchParams] = useState({
    from_location: '',
    to_location: '',
    travel_date: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchGroups();
  }, []);

  const searchGroups = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchParams.from_location) params.from_location = searchParams.from_location;
      if (searchParams.to_location) params.to_location = searchParams.to_location;
      if (searchParams.travel_date) params.travel_date = searchParams.travel_date;

      const response = await axios.get(`${API_URL}/groups`, { params });
      setGroups(response.data);
    } catch (error) {
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold">Discover Groups</h1>
            <p className="text-muted-foreground mt-2">Find your perfect travel companions</p>
          </div>
          <Button
            onClick={() => navigate('/create-group')}
            data-testid="create-group-btn"
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 font-bold shadow-[4px_4px_0px_0px_#0F172A] hover:translate-y-[-2px] transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </Button>
        </div>

        <Card className="p-6 mb-8 border-2 border-border rounded-xl" data-testid="search-card">
          <div className="grid md:grid-cols-4 gap-4">
            <Input
              placeholder="From"
              value={searchParams.from_location}
              onChange={(e) => setSearchParams({ ...searchParams, from_location: e.target.value })}
              data-testid="search-from-input"
              className="border-2 focus:border-primary"
            />
            <Input
              placeholder="To"
              value={searchParams.to_location}
              onChange={(e) => setSearchParams({ ...searchParams, to_location: e.target.value })}
              data-testid="search-to-input"
              className="border-2 focus:border-primary"
            />
            <Input
              type="date"
              value={searchParams.travel_date}
              onChange={(e) => setSearchParams({ ...searchParams, travel_date: e.target.value })}
              data-testid="search-date-input"
              className="border-2 focus:border-primary"
            />
            <Button
              onClick={searchGroups}
              data-testid="search-submit-btn"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full font-bold"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-20">Loading groups...</div>
        ) : groups.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-border rounded-xl">
            <p className="text-xl text-muted-foreground mb-4">No groups found</p>
            <p className="text-muted-foreground mb-6">Be the first to create a group for this route!</p>
            <Button
              onClick={() => navigate('/create-group')}
              data-testid="empty-create-group-btn"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 font-bold"
            >
              Create Group
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="overflow-hidden border-2 border-border rounded-xl hover:border-primary transition-all cursor-pointer hover:shadow-lg"
                onClick={() => navigate(`/group/${group.id}`)}
                data-testid={`group-card-${group.id}`}
              >
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={group.imageUrl || "https://source.unsplash.com/1200x800/?travel"}
                    alt={group.to_location}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80";
                    }}
                  />

                </div>


                <div className="p-6 space-y-3">
                  <h3 className="font-heading font-bold text-xl">
                    {group.from_location} → {group.to_location}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-mono">{new Date(group.travel_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{group.members.length}/{group.max_members} members</span>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {group.trip_type}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
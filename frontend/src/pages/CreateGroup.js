import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import Navbar from '../components/Navbar';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CreateGroup() {
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();
  const [formData, setFormData] = useState({
    from_location: '',
    to_location: '',
    travel_date: '',
    budget_min: '',
    budget_max: '',
    trip_type: '',
    description: '',
    max_members: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        budget_min: parseInt(formData.budget_min),
        budget_max: parseInt(formData.budget_max),
        max_members: parseInt(formData.max_members)
      };
      const response = await axios.post(`${API_URL}/groups`, data, getAuthHeader());
      toast.success('Group created successfully!');
      navigate(`/group/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Create Travel Group</h1>
        <p className="text-muted-foreground mb-8">Find companions for your next adventure</p>

        <Card className="p-8 border-2 border-border rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="create-group-form">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  value={formData.from_location}
                  onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
                  required
                  data-testid="create-from-input"
                  className="mt-1 border-2 focus:border-primary"
                  placeholder="Starting location"
                />
              </div>

              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  value={formData.to_location}
                  onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
                  required
                  data-testid="create-to-input"
                  className="mt-1 border-2 focus:border-primary"
                  placeholder="Destination"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="travel_date">Travel Date</Label>
              <Input
                id="travel_date"
                type="date"
                value={formData.travel_date}
                onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                required
                data-testid="create-date-input"
                className="mt-1 border-2 focus:border-primary"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="budget_min">Min Budget</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  required
                  data-testid="create-budget-min-input"
                  className="mt-1 border-2 focus:border-primary"
                  placeholder="Min budget"
                />
              </div>

              <div>
                <Label htmlFor="budget_max">Max Budget</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  required
                  data-testid="create-budget-max-input"
                  className="mt-1 border-2 focus:border-primary"
                  placeholder="Max budget"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="trip_type">Trip Type</Label>
                <Select
                  value={formData.trip_type}
                  onValueChange={(value) => setFormData({ ...formData, trip_type: value })}
                  required
                >
                  <SelectTrigger data-testid="create-trip-type-select" className="mt-1 border-2">
                    <SelectValue placeholder="Select trip type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="leisure">Leisure</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="max_members">Max Members</Label>
                <Input
                  id="max_members"
                  type="number"
                  value={formData.max_members}
                  onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                  required
                  data-testid="create-max-members-input"
                  className="mt-1 border-2 focus:border-primary"
                  placeholder="Max members"
                  min="2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                data-testid="create-description-input"
                className="mt-1 border-2 focus:border-primary min-h-[120px]"
                placeholder="Describe your trip plans..."
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="create-submit-btn"
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-bold shadow-[4px_4px_0px_0px_#0F172A] hover:translate-y-[-2px] transition-all"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditGroup() {
    const { groupId } = useParams();
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

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 🔹 Fetch existing group data
    useEffect(() => {
        fetchGroup();
        // eslint-disable-next-line
    }, []);

    const fetchGroup = async () => {
        try {
            const res = await axios.get(`${API_URL}/groups/${groupId}`);
            const g = res.data;

            setFormData({
                from_location: g.from_location,
                to_location: g.to_location,
                travel_date: g.travel_date.slice(0, 10),
                budget_min: g.budget_min,
                budget_max: g.budget_max,
                trip_type: g.trip_type,
                description: g.description,
                max_members: g.max_members
            });

            setLoading(false);
        } catch (error) {
            toast.error("You are not authorized to edit this group");
            navigate(`/group/${groupId}`);
        }
    };

    // 🔹 Submit update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                budget_min: parseInt(formData.budget_min),
                budget_max: parseInt(formData.budget_max),
                max_members: parseInt(formData.max_members)
            };

            await axios.put(
                `${API_URL}/groups/${groupId}`,
                payload,
                getAuthHeader()
            );

            toast.success("Group updated successfully");
            navigate(`/group/${groupId}`);
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to update group");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex justify-center items-center h-[60vh]">
                    <p className="text-muted-foreground">Loading group details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="text-4xl font-heading font-bold mb-2">Edit Travel Group</h1>
                <p className="text-muted-foreground mb-8">
                    Update your travel plans
                </p>

                <Card className="p-8 border-2 border-border rounded-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label>From</Label>
                                <Input
                                    value={formData.from_location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, from_location: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <Label>To</Label>
                                <Input
                                    value={formData.to_location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, to_location: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Travel Date</Label>
                            <Input
                                type="date"
                                value={formData.travel_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, travel_date: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label>Min Budget</Label>
                                <Input
                                    type="number"
                                    value={formData.budget_min}
                                    onChange={(e) =>
                                        setFormData({ ...formData, budget_min: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <Label>Max Budget</Label>
                                <Input
                                    type="number"
                                    value={formData.budget_max}
                                    onChange={(e) =>
                                        setFormData({ ...formData, budget_max: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label>Trip Type</Label>
                                <Select
                                    value={formData.trip_type}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, trip_type: value })
                                    }
                                >
                                    <SelectTrigger className="mt-1">
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
                                <Label>Max Members</Label>
                                <Input
                                    type="number"
                                    min="2"
                                    value={formData.max_members}
                                    onChange={(e) =>
                                        setFormData({ ...formData, max_members: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="min-h-[120px]"
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(`/group/${groupId}`)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminLayoutProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
}

export function AdminLayout({ children, title = "Admin Dashboard", description }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

// Sample dashboard component demonstrating shadcn/ui components
export function AdminDashboard() {
  return (
    <AdminLayout
      title="La Pesqueria Outfitters Admin"
      description="Manage your fishing apparel store"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">142</p>
            <p className="text-sm text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$4,230</p>
            <p className="text-sm text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conservation</CardTitle>
            <CardDescription>Total donated</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$423</p>
            <p className="text-sm text-muted-foreground">10% of revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">#ORD-001</TableCell>
                <TableCell>Jane Doe</TableCell>
                <TableCell>Performance Fishing Shirt - Navy</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Shipped
                  </span>
                </TableCell>
                <TableCell className="text-right">$39.99</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">#ORD-002</TableCell>
                <TableCell>John Smith</TableCell>
                <TableCell>Offshore Fishing Hat - Orange</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                    Processing
                  </span>
                </TableCell>
                <TableCell className="text-right">$29.99</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">#ORD-003</TableCell>
                <TableCell>Sarah Johnson</TableCell>
                <TableCell>Deep Sea T-Shirt - XL</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                    Pending
                  </span>
                </TableCell>
                <TableCell className="text-right">$34.99</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-4">
        <Button>Add New Product</Button>
        <Button variant="outline">View All Orders</Button>
        <Button variant="secondary">Export Data</Button>
      </div>
    </AdminLayout>
  );
}

// Sample form component demonstrating form components
export function AdminProductForm() {
  return (
    <AdminLayout title="Add New Product" description="Create a new apparel product">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Enter the details for your new product</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" placeholder="Performance Fishing Shirt" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="High-performance fishing apparel..." />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" placeholder="39.99" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" placeholder="100" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input id="size" placeholder="S, M, L, XL, XXL" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input id="material" placeholder="Performance Poly, Cotton Blend" />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Create Product</Button>
              <Button type="button" variant="outline">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

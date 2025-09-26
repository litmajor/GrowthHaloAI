
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SubscriptionManager from '@/components/SubscriptionManager';
import { ResponsiveContainer } from '@/components/ui/responsive-container';

export default function SubscriptionPage() {
  const userId = "user123"; // This would come from authentication

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveContainer size="lg" className="py-4 sm:py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-foreground">
              Subscription Management
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Manage your Growth Halo subscription, view usage, and update billing information
            </p>
          </div>

          {/* Subscription Manager */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Your Subscription
              </CardTitle>
              <CardDescription>
                Current plan details and usage information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionManager userId={userId} />
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your past invoices and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>No billing history available yet.</p>
                <Button variant="outline" className="mt-4">
                  View Payment Methods
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Contact our support team for billing questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1">
                  Contact Support
                </Button>
                <Link href="/faq">
                  <Button variant="ghost" className="flex-1">
                    View FAQ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
}

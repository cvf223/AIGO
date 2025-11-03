/**
 * 🚀 MEV PROTECTION CENTER PAGE
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const MEVProtection: React.FC = () => {
    return (
        <div className="space-y-6 p-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-primary mb-2">
                    🚀 MEV PROTECTION CENTER
                </h1>
                <p className="text-muted-foreground">
                    L2MEV protection and execution monitoring
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Protection Status</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">MEV protection interface coming soon...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MEVProtection;

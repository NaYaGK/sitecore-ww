'use client';

import React, { createContext, useContext } from 'react';
import { JobDetail } from '@/services/search/job-search-api';

interface JobContextType {
    jobDetail: JobDetail | null;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ jobDetail: JobDetail | null; children: React.ReactNode }> = ({
    jobDetail,
    children,
}) => {
    return <JobContext.Provider value={{ jobDetail }}>{children}</JobContext.Provider>;
};

export const useJobContext = () => {
    const context = useContext(JobContext);
    if (context === undefined) {
        throw new Error('useJobContext must be used within a JobProvider');
    }
    return context;
};

export const useOptionalJobContext = () => {
    return useContext(JobContext);
};

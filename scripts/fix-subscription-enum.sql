-- Add missing values to the existing SubscriptionTier enum
-- This must be run outside of a multi-command transaction if usage follows immediately.
ALTER TYPE "SubscriptionTier" ADD VALUE IF NOT EXISTS 'BASIC';
ALTER TYPE "SubscriptionTier" ADD VALUE IF NOT EXISTS 'PREMIUM';

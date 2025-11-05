import React, { useState, useEffect, useRef } from 'react';

interface AnimatedAmountProps {
    amount: number;
    className?: string;
}

export const AnimatedAmount: React.FC<AnimatedAmountProps> = ({ amount, className }) => {
    const [displayAmount, setDisplayAmount] = useState(0);
    const prevAmountRef = useRef(0);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const startAmount = prevAmountRef.current;
        const endAmount = amount;
        prevAmountRef.current = amount; // Update for the next change
        
        let startTime: number | null = null;
        const duration = 500; // Animation duration in ms

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            // Use an easing function for a smoother effect
            const percentage = Math.min(progress / duration, 1);
            const easedPercentage = percentage < 0.5 ? 2 * percentage * percentage : 1 - Math.pow(-2 * percentage + 2, 2) / 2;

            const current = startAmount + (endAmount - startAmount) * easedPercentage;
            setDisplayAmount(current);

            if (progress < duration) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayAmount(endAmount); // Ensure it ends on the exact amount
            }
        };

        // If amount is 0 immediately, don't animate from previous value
        if (amount === 0 && startAmount === 0) {
            setDisplayAmount(0);
            return;
        }

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [amount]);

    return (
        <p className={className}>
            {displayAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
        </p>
    );
};

import React from 'react';
import classNames from 'classnames';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={classNames('animate-pulse rounded-md bg-[var(--border-subtle)]', className)}
      {...props}
    />
  );
};

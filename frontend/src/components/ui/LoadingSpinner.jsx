

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'loading-spinner-sm',
    md: 'loading-spinner',
    lg: 'loading-spinner-lg',
    xl: 'loading-spinner-lg',
  }
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={sizes[size] || sizes.md}></div>
    </div>
  )
}
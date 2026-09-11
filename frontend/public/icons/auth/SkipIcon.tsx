import * as React from 'react'

export default function SkipIcon(
  props: React.SVGProps<SVGSVGElement>
) {
  return (
    <svg
      viewBox="0 0 13 12"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      <path
        fill="currentColor"
        d="M11 12V0H13V12H11V12M0 12V0L9 6L0 12V12M2 6V6V6V6V6M2 8.25L5.4 6L2 3.75V8.25V8.25"
      />
    </svg>
  )
}
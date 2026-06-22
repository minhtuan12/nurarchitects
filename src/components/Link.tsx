"use client";

import NextLink, { type LinkProps } from "next/link";
import { forwardRef } from "react";

type Props = LinkProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

const Link = forwardRef<HTMLAnchorElement, Props>(function Link(props, ref) {
  return <NextLink ref={ref} {...props} />;
});

export default Link;

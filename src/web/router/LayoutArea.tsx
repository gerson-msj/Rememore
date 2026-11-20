import { useLayoutEffect } from "react";
import { Outlet } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";

type LayoutAreaProps = { area: "aberta" | "protegida" };

export function LayoutArea({ area }: LayoutAreaProps) {
  const { setArea } = useHeader();

  useLayoutEffect(() => {
    setArea(area);
  }, [area, setArea]);

  return <div className={`layout-area-${area}`}><Outlet /></div>;
}

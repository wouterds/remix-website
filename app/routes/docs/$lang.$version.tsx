import * as React from "react";
import invariant from "ts-invariant";
import { json, useLoaderData, Outlet } from "remix";
import type { LoaderFunction } from "remix";
import { useLocation } from "react-router-dom";
import cx from "clsx";

import { getMenu, MenuNode } from "~/utils/docs/get-menu.server";
import markdownStyles from "~/styles/docs.css";
import { Menu } from "~/components/docs-menu";

export let loader: LoaderFunction = async ({ params }) => {
  invariant(!!params.version, "Need a version param");
  invariant(!!params.lang, "Need a lang param");

  let menu: MenuNode[] = await getMenu(params.version, params.lang);
  return json(menu, { headers: { "Cache-Control": "" } });
};

export function links() {
  return [{ rel: "stylesheet", href: markdownStyles }];
}

export default function DocsLayout() {
  let menu = useLoaderData<MenuNode[]>();
  let location = useLocation();
  let detailsRef = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    let details = detailsRef.current;
    if (details && details.hasAttribute("open")) {
      details.removeAttribute("open");
    }
  }, [location]);

  return (
    <div className="md-layout lg:flex lg:h-full px-6">
      {menu.length > 0 ? (
        <div className="lg:hidden">
          <details ref={detailsRef}>
            <summary className="py-4">Docs Navigation</summary>
            <div>
              <Menu nodes={menu} className="py-6 text-d-p-sm font-medium" />
            </div>
          </details>
          <hr className="mb-4" />
        </div>
      ) : null}
      {menu.length > 0 ? (
        <div className="flex-shrink-0 hidden lg:block">
          <div
            className={cx([
              // Sidebar nav scroll container
              "h-full max-h-screen overflow-x-hidden overflow-y-auto", // auto scrolling
              "sticky top-[-1rem]", // sticky behavior
              "w-64 xl:w-80 2xl:w-96", // width
              "py-10 pl-6 pr-3 xl:pr-5 2xl:pr-6", // spacing
            ])}
          >
            <Menu nodes={menu} />
          </div>
        </div>
      ) : null}
      <div className="lg:z-[1] flex-grow lg:h-full">
        <div className="py-6 md:py-8 lg:py-10 lg:pr-6 lg:pl-3 xl:pl-5 2xl:pl-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function unstable_shouldReload() {
  return false;
}

export function useProgressiveLocking(
  navlist: any[],
  completedPages: Set<string>
): string[] {
  const childPaths: string[] = [];
  
  navlist.forEach((item: any) => {
    if (item.children && item.children.length > 0) {
      item.children.forEach((child: any) => {
        if (!child.link.startsWith("http") && !child.link.startsWith("#")) {
          childPaths.push(child.link);
        }
      });
    }
  });
  
  return childPaths.filter((path, index) => {
    if (index === 0) return false;
    const previousPath = childPaths[index - 1];
    if (!previousPath) return true;
    return !completedPages.has(previousPath);
  });
}

import { Icon } from "@fluentui/react";
import { ReactNode } from "react";
import { Button, Row } from "react-bootstrap";

export const ProcessesTableHeader = ({
  className,
  children,
  text,
  sort,
  clickSort,
}: {
  className?: string;
  children?: ReactNode;
  text: string;
  sort: "ascending" | "descending" | undefined;
  clickSort(): void;
}) => {
  return (
    <th className={className} scope="col" aria-sort={sort} title={text}>
      <Row className="m-0">
        <span className="my-auto">{text}</span>
        <Button
          size="sm"
          className="th-button"
          onClick={() => clickSort()}
          aria-label={"Sort on " + text}
        >
          <Icon
            className={sort !== undefined ? "active-filter-icon" : undefined}
            iconName={
              sort !== undefined
                ? sort === "ascending"
                  ? "TriangleSolidUp12"
                  : "TriangleSolidDown12"
                : "ChevronUnfold10"
            }
          />
        </Button>
        {children}
      </Row>
    </th>
  );
};

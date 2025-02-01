import type { LinksFunction } from "react-router";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  MDXEditor,
  Separator,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import styles from "@mdxeditor/editor/style.css?url";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

type Props = {
  className?: string;
  markdown?: string;
};

export const DescriptionEditor = forwardRef<MDXEditorMethods, Props>(
  ({ className, markdown }: Props, ref: ForwardedRef<MDXEditorMethods>) => {
    return (
      <MDXEditor
        ref={ref}
        markdown={markdown ?? ""}
        className={className}
        contentEditableClassName="mdxeditor-overrides"
        plugins={[
          diffSourcePlugin({ diffMarkdown: markdown ?? "" }),
          headingsPlugin({ allowedHeadingLevels: [2, 3, 4, 5, 6] }),
          linkDialogPlugin(),
          linkPlugin(),
          listsPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <Separator />
                <CreateLink />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <ListsToggle />
                <Separator />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    );
  },
);

DescriptionEditor.displayName = "DescriptionEditor";

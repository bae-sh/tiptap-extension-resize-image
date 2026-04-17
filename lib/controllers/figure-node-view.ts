import { NodeSelection } from '@tiptap/pm/state';
import { NodeView } from '@tiptap/pm/view';
import { Node as ProseMirrorNode, DOMSerializer } from '@tiptap/pm/model';
import { AttributeParser } from '../utils/attribute-parser';
import { ImageNodeView } from './image-node-view';

export class FigureNodeView extends ImageNodeView {
  // Overrides dispatchNodeView to preserve NodeSelection after setNodeMarkup
  protected override dispatchNodeView = (): void => {
    const { view, getPos } = this.context;

    if (typeof getPos === 'function') {
      this.clearContainerBorder();

      const newAttrs = {
        ...this.context.node.attrs,
        width:
          AttributeParser.extractWidthFromStyle(this.elements.container.style.cssText) ??
          this.context.node.attrs.width,
        containerStyle: `${this.elements.container.style.cssText}`,
        wrapperStyle: `${this.elements.wrapper.style.cssText}`,
      };

      // setNodeMarkup causes the current NodeSelection to fall back to TextSelection inside the figcaption
      // Manually recreate NodeSelection at the same position to preserve it
      const tr = view.state.tr.setNodeMarkup(getPos(), null, newAttrs);
      const { selection } = view.state;
      const newSelection =
        selection instanceof NodeSelection
          ? NodeSelection.create(tr.doc, selection.from)
          : selection.map(tr.doc, tr.mapping);

      view.dispatch(tr.setSelection(newSelection));
    }
  };

  // Sets NodeSelection to the figure node when the image area is clicked
  private setupNodeSelection(): void {
    this.elements.container.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!this.elements.img.contains(target) && target !== this.elements.img) return;

      const { view, getPos } = this.context;
      if (typeof getPos === 'function') {
        const pos = getPos();
        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)));
      }
    });
  }

  // Overrides the default drag behavior to serialize the figure node
  // based on renderHTML, preventing Controller from being copied
  private setupDragStart(): void {
    this.elements.wrapper.addEventListener('dragstart', (event: DragEvent) => {
      if (!event.dataTransfer) return;

      const { view, getPos } = this.context;
      if (typeof getPos !== 'function') return;

      const pos = getPos();
      const node = view.state.doc.nodeAt(pos);
      if (!node) return;

      const serializer = DOMSerializer.fromSchema(view.state.schema);
      const dom = serializer.serializeNode(node);
      const wrapper = document.createElement('div');
      wrapper.appendChild(dom);

      event.dataTransfer.clearData();
      event.dataTransfer.setData('text/html', wrapper.innerHTML);
      event.dataTransfer.effectAllowed = 'move';
    });
  }

  // Updates the DOM when the node's attrs change.
  // Returns false if the node type has changed to trigger a full re-render
  private update = (node: ProseMirrorNode): boolean => {
    if (node.type !== this.context.node.type) return false;

    this.context.node = node;
    this.elements.wrapper.setAttribute('style', node.attrs.wrapperStyle);
    this.elements.container.setAttribute('style', node.attrs.containerStyle);
    this.setupImageAttributes();
    this.elements.img.setAttribute('style', 'cursor: pointer');
    this.applyResizeLimits();

    return true;
  };

  initializeFigure(): NodeView {
    this.elements.wrapper = document.createElement('figure');
    this.setupDOMStructure();
    this.setupImageAttributes();
    this.elements.img.setAttribute('style', 'cursor: pointer');
    this.applyResizeLimits();

    // contentDOM for figcaption, ProseMirror manages the figcaption content directly
    const figcaption = document.createElement('div');
    figcaption.setAttribute('style', 'display: contents;');
    this.elements.container.appendChild(figcaption);

    const { editable } = this.context.editor.options;
    if (!editable) return { dom: this.elements.wrapper, contentDOM: figcaption };

    this.setupContainerClick();
    this.setupContentClick();
    this.setupNodeSelection();
    this.setupDragStart();

    return {
      dom: this.elements.wrapper,
      contentDOM: figcaption,
      update: this.update,
      stopEvent: (event: Event): boolean => {
        // Allow dragstart to be handled by ProseMirror to ensure view.dragging is set correctly
        if (event.type === 'dragstart') return false;
        // Only allow events inside figcaption to be handled by PM
        return !figcaption.contains(event.target as Node);
      },
      ignoreMutation: (mutation) => {
        // Allow ProseMirror to handle selection changes for cursor movement
        if (mutation.type === 'selection') return false;
        // Ignore mutations outside figcaption to prevent NodeView re-rendering
        return !figcaption.contains(mutation.target as Node);
      },
    };
  }
}

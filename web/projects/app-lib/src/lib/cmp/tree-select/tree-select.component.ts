import { Component, OnInit, Inject, Injectable, ElementRef, HostBinding, OnDestroy, AfterViewChecked } from '@angular/core';
import { JsonService } from '../../http/json.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { JsonResult } from '../../http/http.interface';
import { AppService } from '../../service/app.service';

/**
 * Node for to-do name
 */
export class TreeNode {
  children: TreeNode[];
  name: string;
  data: object;
}

/** Flat to-do name node with expandable and level information */
export class TreeFlatNode {
  name: string;
  level: number;
  expandable: boolean;
  raw: object;
}

// /**
//  * The Json object for to-do list data.
//  */
const TREE_DATA = {
  '組織': {
    '会社A': null,
    'Organic eggs': null,
    'Protein Powder': null,
  },
  '会社C': [
    'Cook dinner',
    'Read the Material Design spec',
    'Upgrade Application to Angular'
  ]
};

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do name or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TreeNode[]>([]);

  get data(): TreeNode[] { return this.dataChange.value; }

  constructor() {
  }

  initialize(treeData: TreeNode[]) {
    // Build the tree nodes from Json object. The result is a list of `TreeNode` with nested
    //     file node as children.
    // const data = this.buildFileTree(TREE_DATA, 0);

    // Notify the change.
    this.dataChange.next(treeData);
  }

  // /**
  //  * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
  //  * The return value is the list of `TreeNode`.
  //  */
  // buildFileTree(obj: { [key: string]: any }, level: number): TreeNode[] {
  //   return Object.keys(obj).reduce<TreeNode[]>((accumulator, key) => {
  //     const value = obj[key];
  //     const node = new TreeNode();
  //     node.name = key;

  //     if (value != null) {
  //       if (typeof value === 'object') {
  //         node.children = this.buildFileTree(value, level + 1);
  //       } else {
  //         node.name = value;
  //       }
  //     }

  //     return accumulator.concat(node);
  //   }, []);
  // }

  /** Add an name to to-do list */
  insertItem(parent: TreeNode, name: string) {
    if (parent.children) {
      parent.children.push({ name: name } as TreeNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TreeNode, name: string) {
    node.name = name;
    this.dataChange.next(this.data);
  }
}


@Component({
  selector: 'app-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss'],
  host: {}
})
export class TreeSelectComponent implements OnInit, OnDestroy, AfterViewChecked {

  ngAfterViewChecked(): void {
    this.app.useFontByEl(this.el.nativeElement);
  }

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TreeFlatNode, TreeNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TreeNode, TreeFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TreeFlatNode | null = null;

  // /** The new name's name */
  // newItemName = '';

  treeControl: FlatTreeControl<TreeFlatNode>;

  treeFlattener: MatTreeFlattener<TreeNode, TreeFlatNode>;

  dataSource: MatTreeFlatDataSource<TreeNode, TreeFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TreeFlatNode>(true /* multiple */);

  // ラジオボタン選択
  singleSelected: any;

  // サブスクリプション
  subs = new Subscription();

  constructor(
    private app: AppService,
    private el: ElementRef,
    private win: MatDialogRef<TreeSelectComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private json: JsonService,
    private _database: ChecklistDatabase) {

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    const change = _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
    this._database.initialize([]);
    this.subs.add(change);

  }

  ngOnInit() {
    const init = this.json.get(this.data["url"], this.data["params"]).subscribe((response?: JsonResult) => {
      //console.log(response);
      if (response) {
        this._database.initialize(response.data);
      }
    });

    this.subs.add(init);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  // formatData(data: []): { [key: string]: any } {

  //   var result = {};

  //   data.forEach((row, index, rows) => {
  //     parent = row["PARENT_NODE"]
  //   });

  //   return result;
  // }


  close() {
    this.win.close()
  }

  // ツリー
  getLevel = (node: TreeFlatNode) => node.level;

  isExpandable = (node: TreeFlatNode) => node.expandable;

  getChildren = (node: TreeNode): TreeNode[] => node.children;

  hasChild = (_: number, _nodeData: TreeFlatNode) => _nodeData.expandable;

  // hasNoContent = (_: number, _nodeData: TreeFlatNode) => _nodeData.name === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TreeNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name
      ? existingNode
      : new TreeFlatNode();
    flatNode.name = node.name;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    flatNode.raw = node.data;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TreeFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TreeFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do name selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TreeFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do name selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TreeFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TreeFlatNode): void {
    let parent: TreeFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TreeFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TreeFlatNode): TreeFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  selectAll() {
    this.treeControl.dataNodes.forEach((node) => {
      this.checklistSelection.select(node);
    });

  }

  unselectAll() {
    this.checklistSelection.selected.forEach(node => {
      this.checklistSelection.deselect(node)
    });
  }

  select() {
    const selectd = [];
    if (this.data['isSingleSelect']) {
      selectd.push(this.singleSelected.raw);
      this.win.close(selectd);
    } else {
      if (this.checklistSelection.selected) {
        this.checklistSelection.selected.forEach((item: TreeFlatNode) => {
          if (item.raw) {
            selectd.push(item.raw);
          }
        });
      }
      this.win.close(selectd);
    }
  }
  // /** Select the category so we can insert the new name. */
  // addNewItem(node: TreeFlatNode) {
  //   const parentNode = this.flatNodeMap.get(node);
  //   this._database.insertItem(parentNode!, '');
  //   this.treeControl.expand(node);
  // }

  // /** Save the node to database */
  // saveNode(node: TreeFlatNode, itemValue: string) {
  //   const nestedNode = this.flatNodeMap.get(node);
  //   this._database.updateItem(nestedNode!, itemValue);
  // }

}

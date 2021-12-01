declare module BasicListApi {
  type ActionHandler = (action: BasicListApi.Action, record: any) => void;

  type Page = {
    title: string;
    type: string;
    searchBar?: boolean;
    trash?: boolean;
  };

  type Child2 = {
    id: number;
    parent_id: number;
    name: string;
    create_time: Date;
    delete_time?: any;
    status: number;
    value: number;
    title: string;
    depth: number;
  };

  type Child = {
    id: number;
    parent_id: number;
    name: string;
    create_time: Date;
    delete_time?: any;
    status: number;
    value: number;
    title: string;
    depth: number;
    children: Child2[];
  };

  type Action = {
    component: string;
    text: string;
    type: string;
    action: string;
    uri?: string;
    method?: string;
  };

  type Field = {
    title: string;
    dataIndex: string;
    key: string;
    type?: string;
    [key: string]: any;
  };

  type TableToolBar = {
    component: string;
    text: string;
    type: string;
    action: string;
    id: string;
    uri: string;
  };

  type BatchToolBar = {
    component: string;
    text: string;
    type: string;
    action: string;
    uri: string;
    method: string;
  };

  type DataSource = {
    [key: string]: any;
  };

  type Meta = {
    total: number;
    per_page: number;
    page: number;
  };

  type Actions = {
    name: string;
    title: string;
    data: Action[];
  };

  type Tabs = {
    name: string;
    title: string;
    data: Field[];
  };

  type ListLayout = {
    tableColumn: Field[];
    tableToolBar: Action[];
    batchToolBar: Action[];
  };
  type PageLayout = {
    tabs: Tabs[];
    actions: Actions[];
  };

  type ListData = {
    page: Page;
    layout: ListLayout;
    dataSource: DataSource[];
    meta: Meta;
  };
  type PageData = {
    page: Page;
    layout: PageLayout;
    dataSource: DataSource;
  };

  type Root = {
    success: boolean;
    message: string;
    data: PageData | ListData;
  };
}

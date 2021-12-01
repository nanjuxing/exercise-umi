import { useState, useEffect, } from 'react'
import { Table, Space, Row, Col, Card, Pagination, Modal as AntdModal, message, Tooltip, Button, InputNumber, Form } from 'antd';
import { useRequest, useIntl, history, useLocation } from 'umi';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { useToggle, useUpdateEffect } from 'ahooks'
import ColumnBuilder from "./build/ColumnBuilder"
import ActionBuilder from "./build/ActionBuilder"
import Modal from "./component/Modal"
import styles from './index.less'
import SearchBuilder from './build/SearchBuilder'
import { submitFieldsAdaptor, } from './helper'
import { stringify } from 'query-string'
import QueueAnim from 'rc-queue-anim'//动画 cnpm i rc-queue-anim -S



function Index() {
    const [pageQuery, setPageQuery] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [modalUri, setModalUri] = useState('')
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const { confirm } = AntdModal
    const [sortQuery, setSortQuery] = useState('')
    const [selectedRows, setSelectedRows] = useState([])
    const [searchVisible, searchAction] = useToggle(false)

    const lang = useIntl()
    const [searchForm] = Form.useForm()
    const location = useLocation()

    const init = useRequest<{ data: BasicListApi.ListData }>
        ((values = false) => {
            if (values.ignoreQuery === true) {
                return {
                    url: `${location.pathname.replace(
                        '/basic-list',
                        '',
                    )}`,
                }
            }
            return {
                url: `${location.pathname.replace(
                    '/basic-list',
                    '',
                )}?${pageQuery}${sortQuery}`,
                params: values,
                paramsSerializer: (params: any) => {
                    return stringify(params, { arrayFormat: 'comma', skipEmptyString: true, skipNull: true });
                }
            }
        },
            {
                onSuccess: () => {
                    setSelectedRowKeys([])
                    setSelectedRows([])
                }
            }
        )
    const request = useRequest(
        (values: any) => {
            message.loading({ content: 'Processing...', key: 'process', duration: 0 })
            const { uri, method, ...formValues } = values
            return {
                url: `${uri}`,
                method,
                data: {
                    ...formValues,
                }
            }
        },
        {
            manual: true,
            onSuccess: (data) => {
                message.success({
                    content: data?.message,
                    key: 'process'
                });
            },
            formatResult: (res: any) => {
                return res;
            },
            throttleInterval: 1000
        }
    )


    useEffect(() => {
        if (modalUri) {
            setModalVisible(true)
        }
    }, [modalUri])

    useUpdateEffect(() => {
        init.run()
    }, [pageQuery, sortQuery]);

    useUpdateEffect(() => {
        init.run({ ignoreQuery: true })
    }, [location.pathname]);


    function actionHandler(action: BasicListApi.Action, record: any) {

        switch (action.action) {
            case 'modal':
                setModalUri(action.uri?.replace(/:\w+/g, (field) => { return record[field.replace(':', '')] }) as string)
                setModalVisible(true)
                break;
            case 'page': {
                const uri = (action.uri?.replace(/:\w+/g, (field) => { return record[field.replace(':', '')] }) as string)
                history.push(`/basic-list${uri}`)
                break;
            }
            case 'modelDesign': {

                const uri = (action.uri?.replace(/:\w+/g, (field) => { return record[field.replace(':', '')] }) as string)
                console.log(uri);

                history.push(`/modal-design${uri}`)
                break;
            }
            case 'reload':
                init.run()
                break;
            case 'delete':
            case 'deletePermanently':
            case 'restore': {
                const operationName = lang.formatMessage({
                    id: `basic-list.list.actionHandler.operation.${action.action}`
                })
                confirm({
                    title: lang.formatMessage(
                        {
                            id: 'basic-list.list.actionHandler.confirmTitle'
                        },
                        {
                            operationName
                        }
                    ),
                    icon: <ExclamationCircleOutlined />,
                    content: bachOverView(Object.keys(record).length ? [record] : selectedRows),
                    okText: `Sure to ${action.action} !!!`,
                    okType: 'danger',
                    cancelText: 'Cancel',
                    onOk() {
                        return request.run({
                            uri: action.uri,
                            method: action.method,
                            type: action.action,
                            ids: Object.keys(record).length ? [record.id] : selectedRows
                        })
                    },
                    onCancel() {
                        console.log("cancle");

                    }
                })
                break;
            }
            default:
                break;
        }
    }

    function bachOverView(dataSource: BasicListApi.Field[]) {
        const tableColumn = ColumnBuilder(init?.data?.layout?.tableColumn, actionHandler)

        return <Table
            size="small"
            rowKey="id"
            dataSource={dataSource}
            columns={[
                tableColumn[0] || [],
                tableColumn[1] || []
            ]}
            pagination={false}
        />
    }

    const paginationChageHandle = (page: any, per_page: any) => {
        setPageQuery(`&page=${page}&per_page=${per_page}`)
    }
    const tableChangeHandler = (_: any, __: any, sorter: any) => {
        if (sorter.order === undefined) {
            setSortQuery('');
        } else {
            const orderBy = sorter.order === 'ascend' ? 'asc' : 'desc';
            setSortQuery(`&sort=&{sorter.field}$order=$order${orderBy}`)
        }
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: (_selectedRowKeys: any, _selectedRows: any) => {
            setSelectedRowKeys(_selectedRowKeys)
            setSelectedRows(_selectedRows)
        }
    }

    const hideModal = (reload = false) => {
        setModalVisible(false)
        setModalUri('')
        if (reload) {
            init.run()
        }
    }
    const onFinish = (value: any) => {
        init.run(submitFieldsAdaptor(value))
    }

    const searchLayout = () => {
        return (
            <QueueAnim type="top"  >
                {searchVisible && (
                    <div key="searchForm">
                        <Card className={styles.searchFrom} key="searchForm" >
                            <Form onFinish={onFinish} form={searchForm}>
                                <Row gutter={24}>
                                    <Col sm={6}>
                                        <Form.Item label='Id' name="id" key='id'>
                                            <InputNumber style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    {SearchBuilder(init.data?.layout.tableColumn)}
                                </Row>
                                <Row>
                                    <Col sm={24} className={styles.textAlignRight}>
                                        <Space>
                                            <Button type='primary' htmlType="submit">Submit</Button>
                                            <Button onClick={() => {
                                                init.run()
                                                searchForm.resetFields()
                                                setSelectedRowKeys([])
                                                setSelectedRows([])
                                            }}>Clear</Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </Form>
                        </Card>
                    </div>
                )}
            </QueueAnim>
        )
    };
    const beforeTableLayout = () => {
        return (
            <Row>
                <Col xs={24} sm={12}>
                    ...
                </Col>
                <Col xs={24} sm={12} className={styles.tableToolbar}>
                    <Space>
                        <Tooltip title="search">
                            <Button shape="circle"
                                icon={<SearchOutlined />}
                                type={searchVisible ? 'primary' : 'default'}
                                onClick={() => {
                                    searchAction.toggle();
                                }}></Button>
                        </Tooltip>
                        {ActionBuilder(init?.data?.layout?.tableToolBar, actionHandler)}
                    </Space>
                </Col>
            </Row>
        );
    };




    const afterTableLayout = () => {
        return (
            <Row>
                <Col xs={24} sm={12}>
                    ...
                </Col>
                <Col xs={24} sm={12} className={styles.tableToolbar}>
                    <Pagination
                        total={init.data?.meta?.total || 0}
                        current={init?.data?.meta?.page || 1}
                        pageSize={init?.data?.meta?.per_page || 10}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `Total ${total} items`}
                        onChange={paginationChageHandle}
                        onShowSizeChange={paginationChageHandle}
                    ></Pagination>
                </Col>
            </Row>
        );
    };

    const batchToolbar = () => {
        return selectedRowKeys.length ? (<Space>{ActionBuilder(init.data?.layout.batchToolBar, actionHandler)}</Space>) : null
    }
    return (
        <PageContainer>
            {searchLayout()}
            <Card>
                {beforeTableLayout()}
                <Table
                    rowKey="id"
                    dataSource={init?.data?.dataSource}
                    columns={ColumnBuilder(init?.data?.layout?.tableColumn, actionHandler)}
                    loading={init?.loading}
                    onChange={tableChangeHandler}
                    rowSelection={rowSelection}
                />
                {afterTableLayout()}
            </Card>
            <Modal
                modalVisible={modalVisible}
                hideModal={() => {
                    hideModal()
                }}
                modalUri={modalUri}
            ></Modal>
            <FooterToolbar extra={batchToolbar()} />
        </PageContainer>
    );
}
export default Index;

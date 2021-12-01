import { useEffect } from 'react'
import { useRequest } from 'umi'
import { Modal as AntdModal, Form, Input, message, Spin } from 'antd';
import FormBuilder from '../build/FormBuilder'
import ActionBuilder from "../build/ActionBuilder"
import { setFieldsAdaptor, submitFieldsAdaptor } from '../helper';
import styles from "../index.less";
import moment from 'moment';


const Modal = ({ modalVisible, hideModal, modalUri }: {
    modalVisible: boolean;
    hideModal: (reload?: boolean) => void; modalUri: String
}) => {
    const [form] = Form.useForm()
    const init = useRequest<{ data: BasicListApi.PageData }>
        (`${modalUri}?`, {
            manual: true,
            onError: () => {
                hideModal()
            },
        })

    const request = useRequest(
        (values: any) => {
            message.loading({ content: 'Processing...', key: 'process', duration: 0 })
            const { uri, method, ...formValues } = values
            return {
                url: `${uri}`,
                method,
                data: {
                    ...submitFieldsAdaptor(formValues),
                }
            }
        },
        {
            manual: true,
            onSuccess: (data) => {
                message.success({
                    content: data?.message,
                    key: 'process'
                })
                hideModal(true)
            },
            formatResult: (res: any) => {
                return res;
            }
        }
    )

    useEffect(() => {
        if (modalVisible) {
            form.resetFields();
            init.run();
        }
    }, [modalUri])


    useEffect(() => {
        if (init.data) {
            form.setFieldsValue(setFieldsAdaptor(init.data))
        }
    }, [init.data])

    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
    }

    const onFinish = (values: any) => {
        request.run(values)
    }

    const actionHandle = (action: BasicListApi.Action) => {

        switch (action.action) {
            case 'submit':
                form.setFieldsValue({ uri: action.uri, method: action.method })
                form.submit()
                break;
            case 'cancel':
                hideModal()
                break
            case 'reset':
                form.resetFields()
                break
            default:
                break;
        }
    }

    return (
        <div>
            {' '}
            <AntdModal
                getContainer={false}//??????
                title='Basic Modal'
                visible={modalVisible}
                onCancel={() => {
                    hideModal()
                }}
                footer={ActionBuilder(init?.data?.layout?.actions[0]?.data, actionHandle, request?.loading)}
                maskClosable={false}
                forceRender
            >
                {init?.loading ? (
                    <Spin className={styles.formSpin} tip="Loading..."></Spin>
                ) : (<Form
                    form={form}
                    {...layout}
                    initialValues={{
                        create_time: moment(),
                        update_time: moment(),
                        status: true
                    }}
                    onFinish={onFinish}
                >
                    {FormBuilder(init?.data?.layout?.tabs[0]?.data)}
                    <Form.Item name='uri' key="uri" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name='method' key='method' hidden><Input /></Form.Item>
                </Form>)}

            </AntdModal>
        </div>
    )
}

export default Modal

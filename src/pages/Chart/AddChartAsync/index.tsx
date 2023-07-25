import { genChartByAiAsyncMqUsingPOST } from '@/services/answerbi/chartController';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Space, Upload, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import React, { useState } from 'react';


const AddChartAsync: React.FC = () => {
  //定义状态，用来接收后端返回值，让它实时展示再页面上
  const [form] = useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);


  const onFinish = async (values: any) => {
    if(submitting) return;
    setSubmitting(true);
    //对接后端，上传数据
    const params = {
      ...values,
      file: undefined,
    };
    try{
      //需要取到上传的原始数据 file->file->originFileObj
      const res = await genChartByAiAsyncMqUsingPOST(params, {}, values.file.file.originFileObj);
      //正常情况下，如果没有返回值就分析失败，有就分析成功
      if(!res?.data){
        message.error(res.message ?? '分析失败');
      }else{
        message.success('分析任务提交成功，稍后请在我的图表页面查看');
        form.resetFields();
      }
    }catch(e: any){
      //异常情况下，提示分析失败+具体失败原因
      message.error('分析失败,' + e.message);
    }
    setSubmitting(false);
  };
  
  return (
    <div className='add-chart-async'>
      <Card title="智能分析">
        <Form
          form={form}
          name="addChart"
          labelAlign='left'
          labelCol={{span : 4}}
          wrapperCol={{span : 16}}
          onFinish={onFinish}
          initialValues={{  }}
        >
          <Form.Item 
            name="goal"
            label="分析目标"
            rules={[{ required: true, message: '请输入分析目标!' }]}
          >
            <TextArea placeholder='请输入你的分析需求，比如：分析网站用户的增长情况'/>
          </Form.Item>

          <Form.Item name="chartName" label="图表名称">
            <Input placeholder='请输入图表名称'/>
          </Form.Item>

          <Form.Item name="chartType" label="图表类型">
            <Select 
              placeholder="请选择图表类型"
              options={[
                {value: '折线图', label: '折线图'},
                {value: '柱状图', label: '柱状图'},
                {value: '堆叠图', label: '堆叠图'},
                {value: '饼图', label: '饼图'},
                {value: '雷达图', label: '雷达图'},
              ]}
            />            
          </Form.Item>

          <Form.Item name="file" label="上传原始数据">
            <Upload name="file">
              <Button icon={<UploadOutlined />}>上传EXCEL文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
            <Space>
              <Button type="primary" htmlType="submit">提交</Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
export default AddChartAsync;

import { listMyChartByPageUsingPOST, regenChartByAiAsyncMqUsingPOST } from '@/services/answerbi/chartController';
import { useModel } from '@umijs/max';
import { Avatar, Button, Card, List, Result, message } from 'antd';
import Search from 'antd/es/input/Search';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';


const MyChartPage: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'created_time',
    sortOrder: 'desc',
  }

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({...initSearchParams});

  const [chartList,setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  //页面加载状态
  const [loading, setLoading] = useState<boolean>(true);

  //从全局状态中获取当前登录用户信息
  const { initialState } = useModel('@@initialState')
  const { currentUser } = initialState ?? {};
  //获取数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);

      if(res.data){
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        //去除图表标题
        if(res.data.records){
          res.data.records.forEach(data => {
            if(data.status === 'succeed'){
              const chartOption = JSON.parse(data.genChart ?? '{}');
              chartOption.title = undefined;
              data.genChart = JSON.stringify(chartOption);
            }
          })
        }
      }else{
        message.error(res.message ?? '获取我的图表失败');
      }
    } catch (e : any) {
      message.error('获取我的图表失败，' + e.message);
    }
    setLoading(false);
  }

  //重新生成
  const [submitting, setSubmitting] = useState<boolean>(false);
  const reloadGenChart = async (chartId: any) => {
    if(submitting) return;
    setSubmitting(true);
    const param = { chartId : chartId };
    try {
      const res = await regenChartByAiAsyncMqUsingPOST(param);
      if(!res?.data){
        message.error(res.message ??'分析失败');
      }else{
        message.success('分析任务提交成功，稍后请在我的图表页面查看');
        //重新加载一下页面
        await loadData();
      }
    } catch (e: any) {
      message.error('分析失败,' + e.message);
    }
    setSubmitting(false);
  }
   
  //首次加载页面时，触发加载数据
  useEffect(() => {
    //这个页面首次渲染的时候，以及这个数组中的搜索条件发生变化的时候，会执行loadData方法，自动触发重新搜索
    /* const timer = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(timer); */    
    loadData();
  },[searchParams]);


  return (
    <div className='my-chart-page'>
      <div>
        <Search placeholder="请输入图表名称" enterButton loading={loading} onSearch={(value) => {
          setSearchParams({
            ...initSearchParams,
            chartName: value,
          })
        }}/>
      </div>
      <div className='margin-16'/>
      <List
        /*
          栅格间隔16像素；
          xs屏幕<576px,栅格数1；
          sm屏幕≥576px,栅格数1；
          md屏幕≥768px,栅格数1；
          lg屏幕≥992px,栅格数2；
          xl屏幕≥1200px,栅格数2；
          xxl屏幕≥1660px,栅格数2
        */
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            })
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{ width: '100%' }}>
              <List.Item.Meta
                avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
                title={item.chartName}
                description={item.chartType ? '图表类型：' + item.chartType : undefined}
              />
              <>
                {
                  item.status === 'wait' && <>
                    <Result
                      status="warning"
                      title="待生成"
                      subTitle={item.execMessage ?? '当前图表生成队列繁忙，请耐心等候'}
                    />
                  </>
                }
                {
                  item.status === 'running' && <>
                    <Result
                      status="info"
                      title="图表生成中"
                      subTitle={item.execMessage}
                    />
                  </>
                }
                {
                  item.status === 'succeed' && <>
                    <div style={{ marginBottom: 16 }} />
                    <p>{'分析目标：' + item.goal}</p>
                    <div style={{ marginBottom: 16 }} />
                    <ReactECharts option={item.genChart && JSON.parse(item.genChart)} />
                    <div style={{ marginBottom: 16 }} />
                    <p>{'分析结论：' + item.genResult}</p>
                  </>
                }
                {
                  item.status === 'failed' && <>
                    <Result
                      status="error"
                      title="图表生成失败"
                      subTitle={item.execMessage}
                      extra={[
                        <Button type="primary" key={item.id} onClick={()=>reloadGenChart(item.id)}>重新生成</Button>
                      ]}
                    />
                  </>
                }
              </>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
export default MyChartPage;

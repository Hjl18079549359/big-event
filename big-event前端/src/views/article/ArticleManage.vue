<script setup>
import {
    Edit,
    Delete
} from '@element-plus/icons-vue'

import { ref } from 'vue'

//文章分类数据模型
const categorys = ref([
    {
        "id": '',
        "categoryName": '',
        "categoryAlias": '',
        "createTime": '',
        "updateTime": ''
    }
])

//用户搜索时选中的分类id
const categoryId=ref('')

//用户搜索时选中的发布状态
const state=ref('')

//文章列表数据模型
const articles = ref([
    {
        "id": '',
        "title": '',
        "content": '',
        "coverImg": '',
        "state": '',
        "categoryId": '',
        "createTime": '',
        "updateTime": ''
    }
])

//分页条数据模型
const pageNum = ref(1)//当前页
const total = ref(20)//总条数
const pageSize = ref(3)//每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
    pageSize.value = size
    getArticles();
}
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
    pageNum.value = num
    getArticles();
}
//文章列表查询
import { articleCategoryListService, articleAddService, articleDeleteService, articleUpdateService } from '@/api/article.js'
const getArticleCategoryList = async () => {
    //获取所有分类
    let resultC = await articleCategoryListService();
    categorys.value = resultC.data
}
getArticleCategoryList();

//文章列表查询
import { articleListService } from '@/api/article.js'
const getArticles = async () => {
    let params = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        categoryId: categoryId.value ? categoryId.value : null,
        state: state.value ? state.value : null
    }
    let result = await articleListService(params);
    //渲染列表数据
    articles.value = result.data.items
    //为列表中添加categoryName属性
    for(let i=0;i<articles.value.length;i++){
        let article = articles.value[i];
        for(let j=0;j<categorys.value.length;j++){
            if(article.categoryId===categorys.value[j].id){
                article.categoryName=categorys.value[j].categoryName
            }
        }
    }
    //渲染总条数
    total.value=result.data.total
}
getArticles()
const reset = () => {
    categoryId.value = ''
    state.value = ''
    getArticles()
}


import {Plus} from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
//控制抽屉是否显示
const visibleDrawer = ref(false)
//当前编辑的文章ID，用于区分添加和编辑模式
const editId = ref(null)
//添加/编辑表单数据模型
const articleModel = ref({
    title: '',
    categoryId: '',
    coverImg: '',
    content:'',
    state:''
})
import { useTokenStore } from '@/stores/token.js'
const tokenStore = useTokenStore();

//上传图片成功回调
const uploadSuccess = (img) => {
    //img就是后台响应的数据，格式为：{code:状态码，message：提示信息，data: 图片的存储地址}
    articleModel.value.coverImg=img.data
    
}
import { ElMessage ,ElMessageBox} from 'element-plus'
//添加或修改文章
const saveArticle=async (state)=>{
    articleModel.value.state = state
    let result;
    if(editId.value){
        //编辑模式
        result = await articleUpdateService({
            ...articleModel.value,
            id: editId.value
        });
        ElMessage.success(result.message? result.message:'修改成功')
    }else{
        //添加模式
        result = await articleAddService(articleModel.value);
        ElMessage.success(result.message? result.message:'添加成功')
    }
    
    //隐藏抽屉
    visibleDrawer.value=false
    
    //重置表单和编辑状态
    resetForm()

    //再次调用getArticles,获取文章
    getArticles()
}

//重置表单
const resetForm = () => {
    articleModel.value = {
        title: '',
        categoryId: '',
        coverImg: '',
        content:'',
        state:''
    }
    editId.value = null
}

//编辑文章
const editArticle = (row) => {
    //设置编辑ID
    editId.value = row.id
    
    //直接使用列表中的数据填充表单
    articleModel.value = {
        title: row.title,
        categoryId: row.categoryId,
        coverImg: row.coverImg,
        content: row.content,
        state: row.state
    }
    
    //打开抽屉
    visibleDrawer.value = true
}
//删除分类
const deleteArticle = (row) => {
    ElMessageBox.confirm(
        '你确认删除该文章信息吗？',
        '温馨提示',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            //用户点击了确认
            let result = await articleDeleteService(row.id)
            ElMessage.success(result.message?result.message:'删除成功')
            //再次调用getAllCategory，获取所有文章分类
            getArticles()
        })
        .catch(() => {
            //用户点击了取消
            ElMessage({
                type: 'info',
                message: '取消删除',
            })
        })
}
</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>文章管理</span>
                <div class="extra">
                    <el-button type="primary" @click="visibleDrawer=true">添加文章</el-button>
                </div>
            </div>
        </template>
        <!-- 搜索表单 -->
        <el-form inline>
            <el-form-item label="文章分类：">
                <el-select placeholder="请选择" v-model="categoryId">
                    <el-option 
                        v-for="c in categorys" 
                        :key="c.id" 
                        :label="c.categoryName"
                        :value="c.id">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="发布状态：">
                <el-select placeholder="请选择" v-model="state">
                    <el-option label="已发布" value="已发布"></el-option>
                    <el-option label="草稿" value="草稿"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="getArticles">搜索</el-button>
                <el-button @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
        <!-- 文章列表 -->
        <el-table :data="articles" style="width: 100%">
            <el-table-column label="文章标题" width="400" prop="title"></el-table-column>
            <el-table-column label="分类" prop="categoryName"></el-table-column>
            <el-table-column label="发表时间" prop="createTime"> </el-table-column>
            <el-table-column label="状态" prop="state"></el-table-column>
            <el-table-column label="操作" width="140">
                <template #default="{ row }">
                    <el-button :icon="Edit" circle plain type="primary" @click="editArticle(row)"></el-button>
                    <el-button :icon="Delete" circle plain type="danger" @click="deleteArticle(row)"></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        <!-- 分页条 -->
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[3, 5 ,10, 15]"
            layout="jumper, total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
            @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" />
        <!-- 抽屉 -->
        <el-drawer v-model="visibleDrawer" :title="editId ? '编辑文章' : '添加文章'" direction="rtl" size="50%" @close="resetForm">
            <!-- 添加/编辑文章表单 -->
            <el-form :model="articleModel" label-width="100px" >
                <el-form-item label="文章标题" >
                    <el-input v-model="articleModel.title" placeholder="请输入标题"></el-input>
                </el-form-item>
                <el-form-item label="文章分类">
                    <el-select placeholder="请选择" v-model="articleModel.categoryId">
                        <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="文章封面">

                    <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false"
                    action="/api/upload"
                    name="file"
                    :headers="{'Authorization':tokenStore.token}"
                    :on-success="uploadSuccess"
                    >
                        <img v-if="articleModel.coverImg" :src="articleModel.coverImg" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
                <el-form-item label="文章内容">
                    <div class="editor">
                        <quill-editor
                                      theme="snow"
                                      v-model:content="articleModel.content"
                                      contentType="html"
                                      >
                        </quill-editor>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="saveArticle('已发布')">发布</el-button>
                    <el-button type="info" @click="saveArticle('草稿')">草稿</el-button>
                </el-form-item>
            </el-form>
        </el-drawer>
    </el-card>
</template>
<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}
/* 抽屉样式 */
.avatar-uploader {
    :deep() {
        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            text-align: center;
        }
    }
}
.editor {
  width: 100%;
  :deep(.ql-editor) {
    min-height: 200px;
  }
}
</style>
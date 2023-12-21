// 类装饰器，TestDatabase被标记成组件
@component
class TestDatabase {
    // 注入配置
    @value("search.page.default.id")
    private defaultId: number;

    // 设置路由地址
    @getMapping("/db/select")
    async selectById(req: Request, res: Response): void {
        const row: UserDto = await this.findRow(req.query.id || defaultId);
        res.send(row);
    }

    // 缓存查询结果
    @cache(1800)
    // 查询数据
    @select("Select * from `user` where id = #{id}")
    private async findRow(
        // 将id参数注入到SQL语句
        @param("id") id: number
    ): UserDto { }
}

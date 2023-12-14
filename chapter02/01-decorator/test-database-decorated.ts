@component
class TestDatabase {
    @value("search.page.default.id")
    private defaultId: number;

    @getMapping("/db/select")
    async selectById(req: Request, res: Response): void {
        const row: UserDto = await this.findRow(req.query.id || defaultId);
        res.send(row);
    }
    
    @cache(1800)
    @select("Select * from `user` where id = #{id}")
    private async findRow(@param("id") id: number): UserDto { }
}

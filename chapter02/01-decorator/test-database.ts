class TestDatabase {
  private defaultId: number = 1;
  selectById(req: Request, res: Response): void {
      const row: UserDto = await this.findRow(req.query.id || defaultId);
      res.send(row);
  }
  private findRow(id: number): UserDto {
  
  }
}

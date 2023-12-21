import { GetMapping, PostMapping } from "../src/route-mapping.decorator";
import { onClass, log, config } from "../src/speed";
import { createPool, ResultSetHeader } from 'mysql2';
const pool = createPool(config("mysql")).promise();

@onClass
export default class TestSqlInjection {
	@GetMapping("/sql/injection")
	async select(req, res) {
		const sql = "Select * from `check_user` where `name` = '" + req.query.name + "' and `password` = '" + req.query.password + "'";
		log("test sql: " + sql);
		const [rows] = await pool.query(sql);
		if (rows === null || Object.keys(rows).length === 0) {
			res.send("账号密码不匹配!");
		} else {
			res.send("登录成功，欢迎你：" + rows[0].name);
		}
	}
}

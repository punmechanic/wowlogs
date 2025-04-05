use refinery::embed_migrations;

embed_migrations!();

pub fn run<C: refinery::Migrate>(conn: &mut C) -> Result<refinery::Report, refinery::Error> {
    migrations::runner().run(conn)
}

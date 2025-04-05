use refinery::embed_migrations;

embed_migrations!("../migrations"); // Path to your migrations directory

pub fn run<C: refinery::Migrate>(conn: &mut C) -> Result<refinery::Report, refinery::Error> {
    migrations::runner().run(conn)
}

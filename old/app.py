from flask import Flask, render_template, request
from scrapy.crawler import CrawlerRunner
from job_scraper.spiders.indeed_spider import IndeedSpider
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
import crochet

crochet.setup()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'a_secret_key'

# Define the form class
class KeywordForm(FlaskForm):
    keyword = StringField('Keyword')
    submit = SubmitField('Search')

@app.route('/', methods=['GET', 'POST'])
def index():
    form = KeywordForm()
    jobs = []
    if form.validate_on_submit():
        keyword = form.keyword.data
        jobs = run_spider(keyword)
    if jobs is None:
        jobs = []
    return render_template('results.html', jobs=jobs, form=form)

@crochet.wait_for(timeout=10.0)
def run_spider(keyword):
    runner = CrawlerRunner()
    spider = runner.create_crawler(IndeedSpider)
    deferred = runner.crawl(spider, keyword=keyword)
    return deferred

if __name__ == '__main__':
    app.run(debug=True)

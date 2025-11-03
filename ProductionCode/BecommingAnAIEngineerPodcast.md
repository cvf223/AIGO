“Welcome to another episode of the Super Data Science Podcast. I'm your host, Jon Krohn. Today, we've got an excellent episode for you with Kirill Eremenko.

So Kirill runs superdata science.com, where they have an AI engineering bootcamp, and Kirill walks us through over the course of the episode, all eight weeks of this AI engineering bootcamp, so that you understand all of the key tools and approaches to be an AI engineer. And after listening to today's episode, you could actually run that kind of a bootcamp DIY all yourself. Enjoy this one.

This episode of Super Data Science is made possible by Dell, Nvidia, and AWS. Kirill, welcome to the Super Data Science Podcast.

Thanks, Jon, for having me, super excited to be back.

Yeah, we're recording in person together in Australia on the Gold Coast.

That's right. You came all the way from America. Thank you.

From America to film this special episode. It's, what's it about? We're talking about AI engineering.

That's right, AI engineering. And today's going to be really fun because my purpose for today is to give people listening, your listeners, a recipe for a DIY bootcamp. We're running a eight week AI “engineering bootcamp at Super Data Science.

We just finished, this week is the last week of the first cohort, the inaugural cohort. And while we welcome everybody who's interested in the bootcamp to apply and see if this is the right thing, I totally appreciate that we have limited spots, only 10 people per cohort, and not everybody would be able to attend or might not be the exact right fit for everybody. So if you want to create your own bootcamp in your own time, I'm going to go exactly through every single week, give you what the participants learned, why they learned it, and like a cool pro tip, and then you can use that to recreate your own bootcamp and learn the same things if you like.

Nice, and so it's an eight week course, so we're going to kind of have eight chapters to this episode. And so just really quickly there, you said this is something that we're doing at Super Data Science, and so I kind of want to disambiguate that there's kind of these two sets. So this is the Super Data Science Podcast, but we're not running an AI engineering bootcamp on “the podcast.

This is, so you, Kirill and Remenko, you founded both this podcast that I've now been hosting for a few years. You used to host it, the Super Data Science Podcast, but you also founded a e-learning platform called superdatascience.com, and that's where this AI engineering bootcamp is run.

Yep, yep, yep. And these things that we're going to be discussing, there's a, like, the bootcamp is at superdatascience.com/bootcamp, and there's like, you can follow along and see the week by week breakdown on that page if you like.

Nice. Sweet. Thank you for that.

I can't wait to dig into it. I can't wait to learn what I need to know.

Alright.

To become an AI engineer, let's start with week one. It's probably the best place to start.

Well, let's do a quick overview for the background, like, what kind of prerequisites there are for somebody who wants to follow this kind of curriculum. Bootcamp is designed to take people from a high intermediate level to advanced or like starting advanced or medium advanced, depending on where you are now. So it's quite a tight range you have to be in to do a “bootcamp like this and the outcome is roughly advanced level, maybe advanced plus.

And the prerequisites that we expected and we asked our participants to have, you have to already know Python. So there's no like learning Python in this bootcamp. You have to already know, you know, the usual things like a bit of PyTorch, a little bit of, you know, scikit-learn, typical work with pandas.

Even though we don't work a lot of pandas, you have to be confident of those things. In addition to Python, you also need to know LLM calls, like API calls for LLMs. They're not difficult.

We recommended some participants that didn't know those to get an overview before the bootcamp because we don't want to spend too much time understanding what an API call is. That's the typical way of calling, whether it's a ChatGPT, also open AI LLMs or Anthropic or GROK or whatever, and also some cloud experience because the way and the cool thing about AI engineering is that to be a, in our view, to be a successful and effective AI engineer, you need to combine two things. One is the science of AI, like how do “you build AI that does a job?

Like how do you build a proof of concept to solve the business problem that your business needs to solve? And by the way, like preface to all of this, the goal of AI in this context is to solve business problems, is to add value to businesses, not just AI for the sake of AI. So first of all is like how do you build a proof of concept that will solve the problem effectively?

And that's the science of AI, which LLMs do you use? How do you combine them? How do you augment them with RAG?

How do you add things to them? How do you use agents? Do you not use agents?

So that's the first four weeks. And the second four weeks, weeks five to eight, that is deployment. And that's the second imperative component of a successful and effective AI engineer is to be able to deploy systems into real world environments, or at least to understand what the deployment takes.

So how do you now take that proof of concept AI, which is like a Jupyter Notebook, and how do you put it into a cloud “environment? The one we used for the bootcamp is AWS. It can be Azure, it can be GCP, it can be in your other environment, your own servers, but you need to understand how do you take that POC and put it into a real world environment?

How do you make it secure? How do you make it efficient? How do you make it cost effective?

How do you make it reliable? How do you make it scalable? Those are all important constraints that don't exist in the world of proof of concept, but they are critical for business, real world business systems, because what if you have one user using it, and then next day you have a thousand, next day you have 10,000 users, it has to be scalable, it has to be secure, it has to be reliable, it has to be cost effective, a lot of people don't think about that, but do you deploy it on serverless architecture, or do you use a server, why?

Why do you choose one or the other? What's your trade-off of a speed of responsiveness to latency depending on the business application? And so the weeks five to “eight focus exactly on that, and the way we described this at the start of the bootcamp was, we have two instructors, one, the first instructor which is your good friend, Ed Donner.

He was fantastic. So we described it as like, Ed explains to you what is possible with AI, creates this huge bubble of dreams, and then in weeks five to eight, our second instructor, Sam, who I've been working with for over a year now.

What's Sam's full name?

Sam Bashton. He's an expert in cloud, he's an expert in AWS, he's been doing it for 15 years, and most recently in the past year, he's been doing specifically LLM deployment, LLM and AI deployment. And then the second half of the bootcamp, Sam comes in and shrinks your dreams back to reality, because not everything that's possible in a proof of concept is going to be possible in a real world deployment.

Sounds like a great structure, and I can definitely vouch for Ed Donner being an unbelievable instructor. He's so thoughtful about where you are as a listener, and provides such great context, such beautiful explanations of technical content. And he manages to...

Him and “I did a... It's now available as a four-hour YouTube video, and so I can provide a link to that in the show notes, but it's an intro to AI agents, and so multi-agent systems, so using things like Crew AI, the OpenAI Agents SDK, Model Context Protocol. We'll end up talking about some of these things in today's episode, I'm sure.

But in that, when we recorded that video, his enthusiasm for what he's doing, and I wasn't in the bootcamp, so I don't know.

You can tell me it's the same thing.

It's unbelievable. Like, I'm just like, how does he maintain that level of energy and excitement? And I asked him about that.

I was like, are you, like, is this a performance? And he's like, no, I just love this so much. He's so blown away by what AI agents can do.

This is his real enthusiasm.

Yeah, for sure. Really, really great guy. So we were talking about prerequisites.

So Python, the second big prerequisite is knowing AWS. So we structured our bootcamp around AWS because it's the most, has the biggest market share and most, like not most, but a lot of “companies do use AWS for their cloud, as a cloud provider, and knowing at least what cloud is, how it works, why it's in, how it's different to on-premises. Having experience setting up your first, even through the console, not necessarily through the CLI, but through just the web interface, your cloud servers running an EC2 instance and things like that.

That was a prerequisite because again, we wanted people to hit the ground running and be able to keep up with the bootcamp. Yeah, and so that's a prerequisite you might need for this bootcamp. Of course, if you're doing a DIY, you can integrate an extra week before in advance to cover some of those things.

Spend a week learning Python.

That's it, yes. Might be enough. The schedule that we had, this could also be useful is Monday or that we have, because we can continue running more cohorts.

Monday, there's three hours, a core session, which is basically learning the skill or the tool set of the week, the skill and hands-on practice. Office hours on a Thursday for two hours, we've been instructed to cover commercial use cases, going back to how important”

“companies do use AWS for their cloud, as a cloud provider, and knowing at least what cloud is, how it works, why it's in, how it's different to on-premises. Having experience setting up your first, even through the console, not necessarily through the CLI, but through just the web interface, your cloud servers running an EC2 instance and things like that.

That was a prerequisite because again, we wanted people to hit the ground running and be able to keep up with the bootcamp. Yeah, and so that's a prerequisite you might need for this bootcamp. Of course, if you're doing a DIY, you can integrate an extra week before in advance to cover some of those things.

Spend a week learning Python.

That's it, yes. Might be enough. The schedule that we had, this could also be useful is Monday or that we have, because we can continue running more cohorts.

Monday, there's three hours, a core session, which is basically learning the skill or the tool set of the week, the skill and hands-on practice. Office hours on a Thursday for two hours, we've been instructed to cover commercial use cases, going back to how important it is to know what business problems this technology can solve.

And so that Monday, that's kind of like a structured lecture. And then Thursday is more unstructured or?

Monday is like semi-structured, it is like a structure in mind, but because it's such a small cohort, it's not a one-way broadcast, it's interactive, so for example, Ed would get the participants to share the screen and do the coding, like one person is sharing and doing the coding, everybody else is following along, they hit a snag and then they start debugging it or change the course of the session. It's really cool because people like Chip in, they have different backgrounds, it's like a very interactive group, they ask questions, there's breaks, and also we run feedback surveys at the end of every core sessions, sessions so that we know like was it too fast, too slow, how do we adjust the next one, things like that. Anyway, so the core session, office hours, there was also AMMAs, we invite experts to answer questions on each week's topic, and yeah, so that's a quick description of what the bootcamp is about, the prerequisites of the schedule , let's dive into it, week one.

Perfect, yeah, tell me what's going on, what's in week one, what's the most important thing to start with when we're learning about AI engineering?

Okay, the most important thing was week one, well, I'll call it the mindset shift week, because a lot of people, especially in the executive and managerial level, people who are running the businesses and making business decisions, at the moment they're affected by the hype of AI and they think, or they not think, but they guess that AI can solve any problem or they have problems or they don't even have a problem, they just want an agent. They hear the term agent, and this is not-

It's like a secret agent, right? I guess that's what we're talking about today, right?

James Bond, levels of 07. Yeah, exactly. Yeah, so like agentic AI or generative AI, and because all businesses are talking about it because it's a hype, often businesses fall into this trap of thinking that a generative AI solution is needed where one is actually not needed, or an agentic AI solution is needed when a generative AI, simple LM solution will be sufficient.
“And so reframing the problem and understanding the problem and like speaking with the business stakeholders to understand what is the problem they're trying to solve and understanding, do you really need large language models here? Do you really need agents here to solve this problem? Maybe a simple script, simple code will be sufficient to solve this problem.

Or maybe something like UiPath, which is the tool that just does things on your screen. There's no really an agent in it, like Robotics Process Automation, right? RPA, maybe that'll be sufficient for the specific problem you're trying to solve.

So that week is about understanding how to assess situations like that. What the participant did is they compared 13 different LLMs and explored reasoning models versus chat models to understand when to use which one and how to contrast different models. Because I think both Ed talks a lot about benchmarks, but also you had Sinan on the podcast recently who talked about, you know, benchmarks can be useful, but really you need to have your own benchmark within your business.

I love that part of the episode. You have to have your own benchmark within the business. So “the pro tip, for each week we're going to have a pro tip, which you can take away.

We're going to share that in this episode?

Yeah, so the pro tip for this week, like there's so much to share. I wish I could share more, but like we're going to be here for hours, but at least one pro tip per week. If you can't define the business goal and success metric, don't build it yet.

You know, you have to first define the business goal and success metric for whatever solution you're going to be building, and then only proceed to exploring what LLM to use and how to build that solution.

Nice. That's a great pro tip.

Yeah. Yeah. And if you're doing the DIY bootcamp, explore as many LLMs as you can in that first week, and just get to play around with the API calls.

They're always changing, you know, like the format of like recently Anthropic, like a few weeks ago, they just changed what they're like. They previously weren't using the OpenAI template or API call, but now they're, you're allowed to use it that way as well. So it's always changed.

So “get up to speed with the latest in LLMs. Just get like an intro for all of that.

This episode of Super Data Science is brought to you by the Dell AI Factory with NVIDIA, helping you fast track your AI adoption from the desktop to the data center. The Dell AI Factory with NVIDIA provides a simple development launchpad that allows you to perform local prototyping in a safe and secure environment. Next, develop and prepare to scale by rapidly building AI and data workflows with container-based microservices, and then deploy and optimize in the enterprise with a scalable infrastructure framework.

Visit www.dell.com/superdatascience to learn more. That's dell.com/superdatascience. Sweet.

So week one is about this mindset shift and having people just become familiar with what kinds of problems can you solve with modern AI solutions, generative AI, agentic AI, and maybe is part of that mindset shift. You know, I realized that there's kind of a grounding part of it where you're kind of where, because you were saying, you know, executives will come into situations where they think that everything can be done by this agent. They can now just, you know, it's human-like “and it can just be plopped into any situation and solve any business problem, which obviously isn't the reality.

Does this mindset shift also, maybe if you're an engineer, maybe you need a mindset shift broadening kind of the other way around, where if you're an engineer, you might be kind of used to it. Maybe you used to do robotic process automation, RPA. And so you kind of have this relatively narrow view of what can be automated.

And so maybe this mindset shift week also helps people expand their horizons if they're in that scenario.

That's a pretty cool idea. Indeed, that might be necessary in some cases. But I think throughout the whole bootcamp, you get the exposures to so many use cases, and especially the office hours, and participants bring in to the discussion, their questions, their specific industries.

Like we had very different. I love that each bootcamp is going to be very different because of the combination of people in it. Like we had people from, for example, healthcare industry, and then on the other hand, we had people from very technical company that processes, it looks like the gatekeeper to LLMs for other “companies to make sure that everything is secure.

And the questions were very varied, like how to use GenAI in medical data too, so that we maintain privacy. On the other hand, how do you use, how do I create or how do I maintain APIs in such a way that my clients or my company's clients are confident that they're secure, reliable, but at the same time scalable. So definitely the mindset shift of the engineer themselves happens throughout the bootcamp as they get exposure to these projects.

Do these people, so you're finishing up the first cohort right now.

Yeah, literally two days from now.

Two days from now, the time of recording. So a few weeks ago, by the time you hear this at the earliest, but not that that really matters. Not for my question.

So this first cohort, are all of these people kind of paying individually or do you have instances that you're aware of where actually this person's employer is paying because they're, yeah, yeah, yeah.

Yeah, we have a few of those instances where the employer is paying.

Because when you're talking about this kind of scenario where an attendee, a bootcamp “, a boot camper, comes with kind of their own use cases, you could imagine for an enterprise, you know, we maybe have people listening who are like, wow, I need to get people in my company on a program like this, either the DIY one that we're going through today or maybe even apply to your formal superdatascience.com bootcamp because they can be armed with their use cases and be getting feedback from experts like Ed and Sam and being able to figure out, you know, what's realistic, how can we get an ROI as quickly as possible on these kinds of ideas?

Yeah, for sure, for sure. And companies, that's a very good point, because companies these days, especially larger companies, have a substantial learning budget per employee. And, you know, it's not uncommon for it to be $5,000, $10,000 per year.

And that is something that people can put towards a boot camp. Yeah, for sure, we have instances of people doing that.

Cool. Anyway, I digress a bit.

Before we do week two, I wanted to ask you, what are your, like, maybe I think we should highlight this a little bit more, chat models versus reasoning “models. What are your thoughts on that? Like, how would you describe to somebody the chat versus reasoning models?

The way that I like to describe these, I wouldn't probably use, I think I know what you're distinguishing there. I probably wouldn't call what you're calling a chat model there a chat model, because both typically, whether it's a reasoning model like 03 from OpenAI, or whether it's a quote-unquote chat model like 40 or 4.1, 4.5 from OpenAI. So with what you're calling a chat model there, I describe those often as kind of like a stream of consciousness.

Where, so the way that I, this takes a little bit of time to get into, but I can take a minute or two here to explain it, and I've certainly done this, if people regularly listen to the show, then they've heard this before. But the way that I describe it is it's like the thinking, fast and slow, that Daniel Kahneman and Amos Tversky and other researchers came up with over decades, I think mostly kind of starting in the 60s and 70s, you know, digging into these two different thinking systems that humans have. So you “have thinking, fast and slow, the fast thinking system is what up until recently, all of these chat, all these generative models were just spitting out tokens, spitting out words or parts of words as quickly as possible based on whatever you just typed in, there's no reflection, you're just like I'm speaking right now.

You know, you kind of ask me a question and I just hope that my stream of consciousness, the words, the tokens that I'm spitting out of my mouth are appropriate and relatively on the mark. So that's what all generative models were doing. Up until about a year ago, we started having our first reasoning models.

So O1 was the first big reasoning model that was released to the public. And with these reasoning models, that is more, that's slow thinking. And so this is more like when you are thinking about some challenging business problem and you get out a notepad and a pen and you're jotting down, okay, what are the key things that I'm trying to solve in this problem?

Who are the personnel or the resources that I have? And you start to map all these things together. Or it “could be a math problem or a computer science problem where you're sketching out on a whiteboard how you might solve this computer science problem, this data science problem.

So in any of those kinds of situations, it isn't linear tokens that are being output. You're iterating in your mind or on a whiteboard or on a piece of paper over like steps, and you're double checking to make sure that you had your assumptions correct. And this ends up being a really powerful thing for an AI model to be able to do, because it can dramatically reduce error rates, for example, by checking over your work and making sure that each of the steps is correct.

And then you end up with... it's more computationally expensive. That's kind of the main trade-off.

But you can end up even without necessarily investing in a more expensive model, in terms of model weights, just by iteratively processing, reflecting on work before outputting a result, you can end up with wildly more accurate, more nuanced, more complex solutions to problems. So yeah, we're seeing amazing results in the International Math Olympiad recently, for example, with models from both OpenAI and “Google getting gold in the International Math Olympiad by using these kinds of reasoning models. And so we're getting really powerful, powerful results.

Anyway, I probably gave a way longer answer.

No, that was spot on. Very useful. So it's one of the things for DIY bootcampers, week one is explore the differences between the two and understand the use cases.

Moving on, week two. Okay, so week two is the behavior design week. And when I was preparing for this podcast, I didn't really want to go down the path of using terms like prompt engineering, because it feels like 20, you know, like three, four years ago, right?

Like prompt engineer, three years ago, prompt engineering was in demand. Everybody wanted to be a prompt engineer. Here we're talking about prompt engineering, but not from the point of view of using LLMs as a user, but more from the design perspective, because there is still a lot of prompt engineering that you have to think through, because that will dictate how your LLM behaves when users do use it.

So we're talking about prompt templates, like the system that uses, that calls the API, how are you going “to pass on the prompt? What kind of system prompt are you going to pass on to that AI LLM? What kind of output are you going to request?

Because for example, LLMs love speaking in JSON, love giving responses in JSON. So if you don't process that format that you're receiving, if you don't parse the JSON, you're just going to have illegible text. So you have to keep those kind of things in mind.

You have to understand that specific LLM that you've selected. How does it work? What kind of prompts do you give it?

What kind of responses are you going to get? And design its behavior around that. In this week, participants used also a tool called Gradio, which allows to deploy a website relatively easily for just visual usage of an LLM.

You're creating a flight assistant application that helps you book tickets for your flights and gives you responses what kind of flights are available and so on. And the pro tip for this week is that basically, there's actually two things. First one is make sure that you parse the structure of the response and you give the right prompt templates.

But “the more interesting tip of the week is that the system prompt is always guaranteed to go to the LLM. You know how you have, like, if your prompt is too big, which is quite hard to do these days, but in terms of the context window, if your prompt or the whole conversation that you've been having with the LLM exceeds the context window, because every time you send a new prompt to the LLM in that same conversation, the whole conversation with all the responses gets resend back to the LLM. So if that exceeds the context window at some point, or your single prompt exceeds the context window, the system prompt, which as a user, if you're just using ChaiGPT, you don't even see the system prompt, but as a designer, as an AI engineer, you can change the system prompt.

Like for example, you are a helpful assistant, or you're a helpful, funny assistant speaking in the, I don't know, language of Master Yoda, or something like that, right? That system prompt is guaranteed to be passed to the LLM. So sometimes we don't know, like what's the point of a system prompt if I can “just give those instructions in the, like add them to the prompt.

Well, the difference is that the system prompt always goes to the LLM even if the context window is exceeded.

I think even if you're not exceeding the context window, if you have a million-token context window, and you provide a million tokens of context, yes, there are various kinds of tests that show that LLMs can retrieve what they call a needle in a haystack. So, you know, if you insert a pizza recipe into a million tokens of information about a podcast episode, you will be able to get that pizza recipe back out, so that needle in a haystack can be found. But despite that, that kind of example, the way that they do those needle in a haystack tests, often those needles that are in the haystack, they're quite different, you know, the needle is quite different from hay.

And so it may not, it's not so surprising that the LLM takes note of, oh, I can't, you know, a million tokens of hay and there's one that's a needle, I should probably keep some attention on that. And so it's perhaps unsurprising “that that kind of result happens, that these needles in a haystack can be found accurately. But if you provide a million tokens of context, the model is not going to, it can't attend equally to all of those million tokens.

And so if there's something that you want to be sure gets through, something like the system prompt can be really helpful. It isn't just to add a little bit of nuance. It isn't just about like, oh, I've run out of tokens, or I have some tokens, let me put that in.

The system prompt provides value, regardless of how much you've stuffed into the context.

For sure. In terms of the DIY bootcamp, what we recommend for week two is pick a project that you're interested in. It's not a super complex, start simple, you can build on it later.

And build a LLM, simple application to serve the project. As I mentioned earlier, the one we did for the bootcamp was a flight assistant, use Gradio to create the website, the visual interface for chatting, and experiment with different modifying LLM behavior using the system prompt, using how you parse the response that comes back in“, some prompt templates and things like that. So use your imagination for designing the business problem.

All right, week three. Ready?

Let's do it.

Week three is RAG, Retrieval Augmented Generation, and it's a RAG Foundations Week. Basically, what I love about the AI space is that it evolves all the time. Maybe a bit too fast, but still.

And if you remember maybe two years ago, the hot thing was fine tuning your LLMs, getting a pre-trained model and then adjusting the model weights in some parameter-efficient fine-tuning or some other way, LoRa, QLora, other things, to get it to understand your domain knowledge, your business context or your specific business data and speak in your business language. I feel that the world is shifting away from that and more towards, so that is like, what is it? That is training time customization.

I feel the world is shifting away from that towards inference time customization, which is more around the rack. You keep the LLM intact, you don't fine-tune it because that is costly and LLMs, these companies release them very often, very frequently. Even if they don't release them, you might want to “change from OpenAI to Anthropic or some other LLM.

If you keep fine-tuning or you can't really fine-tune some of them, because they're a closed source, so you'd be using something like a LLMA model, but what if you want to change later on? So there's lots of restraints. So what the world's moving towards is inference time customization, which is mostly retrieval-augmented generation, RAG.

So you can, without changing the underlying weights of the large language model, you just add dates to it through a vector database, through RAG, and it can pull data directly from documents that are relevant to, or that are relevant to your business, to your industry and things like that. And so that's why RAG is powerful. It's very important for an AI engineer to know RAG.

And in this week, I guess let's talk a bit about what the participants learned. So building for you or for your DIY bootcamp, build a full Retrieval Augment Generation Pipeline from scratch, learn about chunking, embeddings, vector databases, and retrieval chains. Do some research about hierarchical RAG.

So why it performs, outperforms flat retrieval. Hierarchical RAG is when you have, oh, it's kind “of in the name, you have hierarchies of your documents, and then when the LLM needs to find something, it first uses that vector database to find the top layer, where would that information be, then from there go drill further into the specific document, then the specific page or whatever else.

So that could maybe be something like, if you have legal documents, the high level could be the whole document, and then you could like add a level deeper in the hierarchy, it could be all the clauses in a document, and then a level deeper, you could have all of the sentences in a clause.

Yeah, yeah, or you could even have an even higher level, like if you have legal documents, HR policies in your company, you have, I don't know, maybe it's a tech heavy, or asset heavy industry, so you have descriptions of your different assets, or your procurement documents, suppliers, and so on. So where does it go in the first place, right? Like is this a question about legal term, or is this a question about how we procure things, or is a question about HR policies, and drills down further like “that.

So it can be definitely very powerful. The tools that we recommend for week three are open AI embeddings, Chroma databases, Lang chain retrievers. So a lot of the work we did was, or the participants did was around using Lang chain, and the Chroma database is a simple to set up database.

You could be using some AWS open search, which used to be called Elasticsearch, but a Chroma database would be like, was the choice because it's just, you spend less time thinking through how to set it up and more on how you're using it. The pro tip here is really interesting. Smart chunking improves performance.

So overlap, think about when you're chunking your data for retrieval for vector databases, think about overlap and also semantic clarity and context aware chunking. That's probably my fair part that you can chunk like your data when you're putting into a vector store, let's say 500 characters or 500 tokens per chunk. But then you might end up with situations where like something split in the middle, right?

Like you're like a certain HR policy is like split right in the middle. You could chunk by section of your “document. Make sure you could make your chunks overlap, but also context aware chunking is like, is the art of putting these things into your vector store.

Because remember that embedding models are shallow and they can miss certain things. So you need to, let me, I'm just trying to find an example here. If you're looking for some information on like who, I think the example in the bootcamp was who won the last year's employee of the year award.

And that is in some HR document. But then if the chunking like cuts it in half, the employee award of the year was awarded too. And then the name is in the next chunk, then it might not be able to find it.

So yeah, smart chunking can really affect the effectiveness of your rag.

For you listeners looking to level up your AI career through hands-on training and fun networking, then ODSC AI West, this October 28th to 30th in San Francisco is for you. This event will allow you to build cutting edge AI skills with instruction from world class AI experts and immersive events like hackathons, networking receptions, book signings and more. ODSC AI “is the go-to conference to connect with industry leaders and other AI pros in the field.

It's my favorite for sure. And it's all designed to help you gain the skills you need to succeed. Use the code SUPER at checkout on odsc.ai and you'll get an additional 15% off your pass.

Wow, that's a good deal. Check it out at odsc.ai and put in that code SUPER. For sure.

Some documents naturally have chunks like the legal documents I was describing. Each document could be a different chunk or each clause could be a different chunk. But sometimes you just have, you know, what if you're putting in a novel and you want to be able to break up that novel into sensible chunks, you can't just do it by page of the novel because you'd end up arbitrarily cutting semantic structure.

We hear about RAG a lot in a time where context windows are getting larger and larger. Do you think that RAG will continue to be as needed in the future? And I have an opinion on this.

Yeah. So you're saying context windows are getting larger and larger.

If we have context windows of, you “know, so if you have a, RAG was devised starting some years ago when context windows might have only been 4,000 or 8,000 tokens. And so of course you couldn't fit a very large number of documents in. But now that we have a million token context windows with some regularity, 10 million token context windows coming up in some cases, do you think RAG is as relevant?

So isn't like just put everything in there? Like all your company's documents, all the everything always in the context.

Yeah.

I think it goes back to your point about relevancy. Like if there's so much, I don't know, like the way I would think about it is as a human, like I have a lot of big context window, right? In my, like it's not long-term memory, right?

Like, but I can, yeah, it's probably not the same. But if we think of my memory, not just as a long-term memory, but as my whole context, right? Like I could technically pull out any information that I remember, not all the experiences of my life, but any information I remember.

But still, when I, when like somebody asks me “a question about, I don't know, like cooking something, I will first like find the right reference in my memory and then pull that up, pull that and explain that, like talk about that. Like if I try to reference all the things I had about cooking that specific, let's say cooking pasta, right? I might end up just confuse myself with all the overwhelm of information.

Yeah, I think we always, we get into dangerous territory anytime we're trying to make analogies exactly to the way our thinking works, just as I was, you know, earlier in this episode talking about thinking fast and slow, you know, the way that our own brain thinks slowly is for sure different than the way that a reasoning model is like 03. But I think I might, in terms of what you're describing there, if you think about your whole brain as one big context window, you know, that isn't going to be as accurate as if you say, you know, you had notes or a computer database of, you know, if someone asks you a cooking question, and instead of just relying on your big context, which is, you know, it’s “probably going to be a little bit fuzzy, especially if you haven't been thinking about that, cooking that particular thing recently. Whereas if somebody asks you a cooking question, you say, oh, you know what?

I have that on a card in my kitchen, and you flick through the recipe cards, you pull out the exact recipe card and you're like, here, this is exactly the information you're looking for. I think that that kind of like that, you know, that recipe card example is kind of, that's a bit more like rag where you're able to retrieve very specific, accurate information, as opposed to kind of relying on like a fuzzy memory.

That's an even better analogy.

Yeah, anyway.

So rag is here to stay at least.

I think it's here to stay. And also, you see, yeah, so I think because you get higher accuracy than if you just rely on a gigantic context window. Like, you know, there's conversation and there's people working on academic approaches of like an infinite context window.

Yeah. But I think, I think accuracy suffers.

You always got to bring it back to the commercial use case. What is it that you’re “trying to solve? Like, oh, yes.

And then when you're interested in things commercially, unlike in an academic environment, you're of course also interested in cost.

Yeah.

And when you have a gigantic context window, your costs increase.

Yeah, exactly.

Yeah, for sure. Whereas with RAG, you're just like, okay, you know, you're only using the expensive LLM based processing on this relatively small set of documents that come back as opposed to over the whole context.

Yeah. Because with like, as we discussed earlier, with the context window, if you have like 10 million tokens in your context window, then every time you reply to the LLM or you do another prompt, all of those 10 million keep going back and forth, back and forth. There are ways to make it more efficient, which we'll talk a bit more about down the line, but yeah, cost commercial, right?

Like we got to think commercial at the end of the day.

For sure. Thanks.

Okay. So that was week three. Now week four, which is the final week of the first half of the bootcamp, which was led by Ed, or is led by Ed.

And this one is about “agentic AI. So by this point, participants are well equipped to start moving to agentic AI. And basically the way to think about agentic AI is like you just have an LLM as a brain and it has access to memory.

It has access to rag. It has access to tools that you give it access to. And then it can perform certain actions as an agent.

So it has some agency. And pro tip number one is very, it's kind of philosophical in a way, but really just understanding how these agents work. For me, it was a really cool revelation that agents don't actually call the tools themselves.

An agent, when an agent wants to call the tool, the LLM that's behind the agent, that's the brain of the agent, will say to your system that's running the LLM that you've created, it will say, I need access, I need a response from this tool. Let's say you gave it access to Gmail. So it will say, I need access, I need to find out this from your Gmail.

Can you please make the call for me? So it actually talks to the system that's running the LLM. So you create a system with code, and then there you're calling the LLM through API.

So the agent is doing its thing, and it's like, I need to check something in Gmail. So it will say, in text as a response in the LLM conversation, it will say, can you please call Gmail and tell me what it says? So you get that response from the LLM, your system that you've created then calls Gmail on its own, gets a response from Gmail, and then sends it back to the LLM.

So LLM doesn't, it sounds like an agent can go and pull these levers and access tools and write in databases or in your calendar or whatever other tools you give it access to. All it can do is still the good old fashioned text, the back and forth, it's all done through text, like through prompts, it responds, and then your system gives it to prompt. So that's a very interesting pro tip that LLMs work in that way with tools.

Yeah, the LLMs are providing more of a glue than, it's not like the agent, you know, if you're using the OpenAI API, you know, some “LLM calling by the OpenAI API, when you, it's not like you're providing all of your emails in Gmail to the OpenAI API, you just have these LLM calls acting as a glue between that retrieval tool out of Gmail.

Yep, exactly. And the second pro tip for this week is route the calls to the right tools with your system that you design with code. Like let's say you give your agent multiple tools to choose from.

I think the example they had was, like if it has access to like a calculator, and what was the second thing that it had access to? So basically let's say it has access to a calculator and your email inbox. So then you, the question that it needs answers to is like, what's 2 plus 2?

Something simple. Obviously that's the calculator that needs to be used for that, right? Like it's a very simplified example, but in that case obviously the calculator, there's no point in trying to search for the answer to 2 plus 2 in your Gmail.

And like in this particular case the LM might make the right call, but in more complex cases it might not “make the right decision which tool to use. And so that decision on which tool to actually call, which tool to use for a specific question, is better to be made by your code that you're calling the LM from, rather than the LM itself. Okay, so that was week four.

And by the way, the agent that they built was really cool. Now this is a cool story here. They built a digital twin, so basically an AI agent that is like your alter ego online, which has access to your LinkedIn, your resume, any kind of blogs you may have written, your GitHub repository of all the projects you've done.

You can also add, some participants added transcripts of this bootcamp sessions to say, I'm attending this bootcamp, this is what I know. And so the agent was able to answer questions about, like on an interview, like an interviewer would be able to ask questions like, oh, what do you know? What's your experience?

What kind of things have you built? How would you approach these kinds of problems? What industries have you worked in?

And so on. And the funny story is that one of the “participants had a goal before the bootcamp. So I interviewed every single person and I asked, what was your goal for the bootcamp?

And for one participant, the goal was to be able to land an AI engineering job within three months of completing the bootcamp. Because what they did is, they're already quite senior, but they're mostly in building data pipelines, and they wanted to really get into AI engineering. So they quit their job and they're like learning about AI and they're participating in this bootcamp, and they wanted to get a job within three months, and that would be a success for them.

That's a successful investment of time and money into the bootcamp. And as they were doing this week three and four, they built this agent and that person actually used the agent at an interview. And so when the interviewer is asking them questions, like, actually I built an agent for this, let me share my screen.

And so this is the agent now. You ask questions and instead of me answering it, the agent will answer your questions. And he was typing it into this interface that I think they built with Gradio “as well.

And so the interviewer could see how the agent was responding to the, to their questions. And at the same time, the participant bootcamp explained how they built this agent. What's in the back, the backend, what system prompts, what, how they implemented RAG, what memory they use and all the things behind it.

And they got the job.

So the AI agent that kind of everyone built in week four was this, it was kind of like, like based on their biography or their resume, like so it was able to kind of answer career questions.

Yeah, on each person's resume, LinkedIn, any blogs they've written, any videos they've created, if they have, so anything you want that you can augment it with using RAG. And obviously, you know, like make it interactive, give it an interface, give it memory, so it can understand what kind of questions people have asked and what responses it was able to provide and things like that. And even like get a notification on your SMS when somebody's using an agent, you get a notification about it.

Now, so what makes, maybe this is a dumb question, but what makes that “application, that use case of an agent, like what is agentic about that as opposed to just generative? Like searching over a RAG database, is it because there's tool use involved?

Yes, exactly. Exactly, yeah. There's tool use, for example, when somebody would interact with an agent, they would get like a push notification on their phone, saying, oh, this person, because you got to put in your email to interact with agent, this person has just interacted with me, your agent, here's how you can contact them.

There is also a database for long-term memory to store all the questions and answers and things like that, yeah.

Right, so what makes it agentic is it's not like a, you know, it's not a hard-coded workflow in terms of, so the agent gets, you know, it has to be able to reason based on the circumstances, reason in quotes. It has to be able to say, okay, you know, now this is a situation where a tool like being able to provide a push notification via SMS would come in handy. So therefore I'll invoke that tool and this is the information that I'm providing.

You know, this “is the draft of the SMS that will be sent out. And so all those kinds of things, yeah, it makes it more than just this linear generative workflow.

Yeah, yeah, more than just an LLM with FRAG, yeah, for sure. So yeah, that's a project we would recommend for the DIY Bootcamp. Try to create a digital twin of yourself and use it in interviews, if you're, or you know, just for fun, share it with friends.

Okay, so that's week four, which brings us to the end of the first half of the Bootcamp.

Hey, hey, this is your host Jon Krohn. I'm excited to announce that I've launched my own AI consultancy, a firm called Y Carrot. Yes, the letter Y and the deliciously crunchy veggie.

At Y Carrot, we combine decades of experience in machine learning and software development with internationally recognized expertise in all the cutting edge approaches, including gen AI, multi-agent systems and RAG. From problem scoping and proof of concept through to high volume production deployments, we can do it all. To learn more, head to ycarot.com.

From there, you can click partner with us to tell us exactly how we can “help. Again, that's ycarot.com.

Maybe I'll just quickly recap those four weeks. So in those first four weeks, week one was about a mind shift, a mindset shift. Week two was behavior design week.

Week three was RAG foundations. And then I'm guessing we're going to have more RAG maybe in the second half. Given that title.

And then four was agentic AI. Of course, an exciting topic that we could easily spend many episodes taking into. Nice.

All right. Cool. Great.

First half of the bootcamp. What are we up to in the second half? I know we got Sam as the instructor for the second half in your superdatascience.com bootcamp.

And so you described kind of at the outset of this interview of this episode, that with the first four weeks that we've already covered, this was kind of about broadening people's horizons and showing them what's possible in terms of prototypes. But then in the weeks five to eight, in the second half that we're gonna talk about now, it's more about grounding people, making sure that things are cost-effective, commercial, probably safe, those kinds of things.

Safe, secure, reliable, scalable, all those things that you “want cloud applications running in production to be. That's what we want for AI applications as well. And the beauty of the structure, like the way we structure the bootcamp is that a lot of the things you do in weeks one to four, you will redo them or you'll build on them.

So you take those POCs and then you, like we'll be talking about RAG again, now we'll be talking about agents again, but now in the production kind of way. So week five, production readiness week. So from prototype to production, what it really takes.

And here, basically, you get your first exposure to what are the differences. There's a lot of setup for this week. You need to set up your CLI for AWS.

You need to be able to log in to AWS through CLI. You need to be able to run things like infrastructure as code. So we don't, at this stage of the bootcamp, we don't use things like Terraform, but already we're using some native AWS ways of doing infrastructure as code, which is important, so it makes it repeatable.

So it's not just you clicking in an online visual console. Also “Docker, so deploying things in Docker containers. And other tools that are needed to properly deploy production applications.

And the pro tip here is wrapping LLM calls in a caching layer. Caching?

Caching.

Caching. Caching layer. It saves money, speeds things up, and stabilizes output.

So basically, if you're building an LLM or an AI tool, put a caching layer around it, so if somebody sends a query that they've sent before, that is stored in the cache, so that doesn't actually have to go out to the LLM API. It can be retrieved from the cache, and then therefore you save on cost, because you didn't call the LLM API. You get the same response again, because you're not generating anything.

So it makes it a bit more deterministic, and it speeds things up. You don't have to wait for the LLM to process. You have the answer right there.

And that can be a very useful solution for probably more than half, maybe like 80% of business applications that you'd be building. Because if one user has a question about HR policy, then the answer that was given to that user is correct. If another user asks the “same question, why would you need an LLM to go and do that?

Unless it's been enough time that the HR policy might have changed. Or some legal document, or some procurement or supplier relationships and things like that. So in a lot of business use cases, you don't need to reinvent the wheel when your users are asking the same questions.

You want it to be efficient. Like it looks cool that you're talking to an LLM and you're in track and field. But if you can get that answer from the cache before the LLM API call is made, why not?

It's good on all around. It's just not as cool, but it's not about being cool. It's about being effective commercially.

Great bottom line there. Yeah, for sure. What was the, somehow, what was the kind of week five, what was the-

Production readiness week. So basically taking your, it's not one of the app, I think what they did is they took the weather app that we were talking about weeks one and two, that was built using Jupyter Notebooks plus Gradio in a proof of concept way. Taking that and now, okay, it's no longer “just a Jupyter Notebook, it's not longer just using a tool like Gradio, which is like a testing tool for visual chat interface.

This time, how do we put it into AWS, how do we put in that same application, how do we now convert it into code that we put into a Docker container, how do we upload the Docker container, how do we create GitHub code that supports CICD workflows, continuous integration, continuous deployment, so that when we update the code, then it gets pushed automatically. Then, what do we use in the bootcamp, they use Lambda functions versus EC2 instances, why? Well, because it's cheaper, right?

Like, why would you want an EC2 instance running all the time when you only need, so we're not, by the way, we're not running the LLM, so the LLM is still, the API is still being made, the API code is still being made to the OpenAI LLM or whatever, Anthropic or whatever LLM you're using, but you do need to run the system, your AI system that is enabling this, it's a tool, right? So you've built an AI system that uses an LLM or that calls an LLM, “but that system needs to be running somewhere. So you could be running on an EC2 instance, but why would you do that if it's only been used occasionally, right?

It depends on your use case. Maybe in your business and this specific business problem, it needs to be running all the time, it needs to be running on multiple instances, it needs to be available 24-7, then you do that. But in this case, this weather application, the assumption was that it's going to be used from time to time, not always, and it can be, there's a slight delay is acceptable, so then the solution for that is Lambda.

So you have to think through the architecture like that, that's why some AWS and cloud knowledge is important, so you know the difference between server solutions or serverless solutions like Lambda. So they use Lambda and that way basically deploy it and you only pay for when that Lambda code is run. So you, whenever that application is called, the Lambda code, the Lambda has got a cold start, it spins up, then it runs it, so there's a slight delay, you get your answer and then “you can talk with the agent, or not the agent, with the application, then it goes back to sleep.

And by the way, AWS has a very generous free tier for Lambda, I think it's like, don't quote me on this, like a million, million seconds or a million minutes, I'm not sure, but it's a lot of time you can use them, so plenty for your DIY bootcamp, there's plenty of free tier there, or even if you want to do it on EC2, that's also available, to test things out without incurring a lot of costs.

Cool, thank you for that production, readiness week overview, and did you give us the pro tip?

The pro tip for week five, yeah, the caching layer.

Oh yeah, the caching.

Yeah, caching, caching layer, yep.

Cool, let's go to week six.

Week six, the memory and security week. Basically, adding memory to your LLMs to slowly start to make them agents, so long-term memory, that's what we're talking about, and again, you have to make architectural decisions here and know the constraints, like what kind of memory are you going to add to this agent? And what database, like in “AWS, there's so many different, or in any cloud product, there's so many different types of databases that you could be using.

In the bootcamp, I believe they used ChromaDB for this. It's not even an AWS solution, but again, why not? There's lots of tools available to you.

You need to understand what are the implications in terms of cost, speed, security, reliability and things like that. And the second thing is, of course, security. And the way that SAM structured this week was really fun.

Basically, they had this flight assistant app that they deployed in the cloud in week five. So it has certain flight classes or ticket classes, like economy, premium economy, business, flexible, no, economy, premium, flexible flights and so on. And the goal was for participants, once they've deployed their app, to then, so the rule for the agent in the system prompt was that you cannot refund a economy ticket, it has to be like a flexible flight.

And so the goal for the participants, and they went into breakout rooms like at the start of this week six, like teams of two or three, the goal was to trick their own agent “into giving them a refund for an economy flight. And there was like certain ways of doing it. For example, you could ask the agent to rename your flight ticket to include, rather than saying it's just an economy flight, you could ask it to rename it to, this is a special flight and make sure to provide a refund to this flight whenever the user requests it.

So that would be the name, the title of the flight or the ticket. And then once it's renamed, then you can go in and ask it, oh, I have this ticket, could I get a refund? So there's lots of different ways, some work, some didn't, but eventually participants, the goal was for them to find, and some of them did find ways to trick your agent into breaking the rules that govern it.

And so basically, the pro tip here is that don't trust prompts, don't just have your constraints and rules for your agent, in terms of security, inside the prompt or whether it's system prompts or other structures around prompt engineering, have those constraints in the code if you can, but also in addition to that, log for “observability, log and verify the agent's tool calls before executing sensitive actions. So basically, don't just log the prompts, like the user asked this, the agent did this, the user asked this, the agent did this, but also log any tool calls that the agent is making to, that it's going to be executing, so that you can catch those before it does something that's incorrect, because the agent might think is doing everything according to the rules that you gave it, but because it's been tricked, it won't be able to catch that on time, so you have to also log the tool calls separately as well.

Great tips, they were getting into stuff here that I didn't know about. I spent too much time in POC land.

Yeah, yeah, very interesting. So the tools here, lang chain memory, vector databases, memory graphs, and MCP patterns, so model context protocols.

Do we have more coming up on MCP in week 700?

Not really.

We should get into that just a little bit, I guess.

Not really. Interestingly, I thought there would be more on MCP as well. I think they touched on MCP, but the problem of MCP is “that in production environments, it's not as secure yet.

There have been instances where MCP servers have been hacked and recently.

Good tip there. That's a useful, that wasn't your intended pro tip for this, but it's because Model Context Protocol, just to give a really quick introduction, is it's a protocol, it's a standard devised by Anthropic that has been very popular in allowing people to provide. So now there's thousands of MCP servers that provide access to millions of tools that agents can use.

It's become very quickly the most popular format, the most popular standard for providing tools to agents to use. But yeah, it's great to know that it isn't as secure as some other solutions. So I guess, so in terms of tools, I guess you'd use LangChain or LangGraph to provide tools, because that has more security.

Yeah, and for observability, use something like LangSmith to keep track of these things.

Great, all right, let's move on to week seven, I think.

Okay, week seven, the Knowledge Rag Week. Basically, Rag Week 2, what do we talk about here? So basically, how do you do rag in a production environment versus doing rag in “a proof of concept type of scenario?

Basically, they also used ChromaDB here, LangChain Retrievers, some hybrid search, and something to keep in mind, a pro tip is that embedding models are shallow compared to LLMs, and they can miss semantic links. So design your queries, so we previously talked about chunking, but also in rag, but also in rag, design your queries to rag in a way that accounts for any semantic mismatch. So for example, if you have a document that, like an HR policy, for example, says, talks about part-time employees, and how they're eligible for prorated annual leave under certain conditions.

If the part-time employee asks a question such as, can I get paid time off PTO if I work part-time? There might be a semantic mismatch because paid time off might be not close enough to prorated annual leave. So they mean the same thing, but in your vector database, they might just happen not to be close enough for the rag to pick that up and give sufficient information to the LM to respond correctly.

So design your rag systems with that in mind, and what you would do in this “case is you would have another LLM that would be parsing that question before it goes to rag. You can rephrase it in several different ways, and then look up each one of them, and then the response that you get from rag, you rate them based on relevancy by that LLM, and then you give it back to the original LLM that is interacting with the user. So yeah, that's a pro tip.

Just remember that embedding models that are used for rag, they're actually shallow compared to LLMs, they're not as smart.

Nice pro tip that makes it easy to follow, and to understand the importance of picking the right rag solution for the particular situation that we're in, and just get the whole workflow set up properly for the kind of use case that we have.

Yep, and so in this week, if you're doing the DIY bootcamp, add some rag systems to your AI application in production. See how it's different to what you would be doing in a proof of concept world.

Fantastic. We're pretty much there.

Yeah.

So in the second half of the DIY AI bootcamp, AI engineering bootcamp, we had in week “five, production readiness, week six, memory and security, week seven, we just covered his knowledge rag, what's in the final week, week eight?

Final week is, so week seven and eight are linked. Week seven is when they start taking this digital twin and putting it into production. You remember from weeks three and four.

So they start putting that into production and then in week eight, they finalize this as a capstone project so that it's a digital twin that is actually functioning not just on a proof of concept, a Gradio instance, but it's actually running on your AWS environment with all the bells and whistles. So basically you have it, so AWS recently moved away from their, what was it, CodeDeploy or was it CodeCommit? So one of their tools, they moved to GitHub, so they're using GitHub instead.

So by the end of week eight, you have your whole digital twin set up as code on GitHub, which is linked to GitHub Actions that push any updates straight into your infrastructure's code on AWS in a Docker container running on Lambda. So that whole thing is now automated with CI-CD and any changes you make “go get pushed out right away. It is scalable because Lambda is serverless.

It is, you've already thought through the security, which would be the week six. You've done some security to make sure that people, like basic security, you can always, there's no limit to security you can do, right? So, but there's some relevant security so people can't hack through your system.

Like get your digital twin to do things that it's not meant to do, answer questions that it's not meant to answer. And on top of that, the goal or like the theme of week eight is that your agents, treat your agents like a product. It's not just a project, it's a product.

And a product should evolve over time, learn from its gaps and get smarter over time. So that's also the pro tip, like don't just treat your AI projects as projects, when they go in production they're products. And what's the way they address that in week eight, or the way you can address that in week eight of your DIY bootcamp is basically set up a system for your AI agent, which is your digital twin, that whenever somebody asks it “a question, and it doesn't know the answer, that it stores that in memory, and it sends you a push notification saying, I've been interacting with so-and-so, they asked me about your, I don't know what you were doing, why you had a gap in your resume between 2012 and 13, I couldn't answer that question, please update your knowledge base.

And then you go in and you update it. So that's a way of evolving of like, of your agent actually working with you to help it evolve over time as a product that is closing any gaps that it has. So that's exactly what they did.

And the tools that they use were LangSmith, LangChain, Evaluators, AWS Deployment.

This is, I feel like I'm asking a dumb question at this point, but what was the kind of the, what was the theme, what was the title of this week eight?

Oh, sorry, I didn't give you the title. It's the Capstone Week.

Capstone Week.

Yep.

Nice, and that makes sense, given everything that you've said, because what I was going to say to kind of summarize week eight is that it sounds like you're left with “by the end of week eight a scalable, secure, powerful, agentic AI application for your particular use case.

Exactly, exactly, and not only that, it's also set up with CI-CD workflow, which is very important for updating and deploying new versions to production, and you learn how to do all of that. That's what you should be aiming for in your DIY bootcamp. Like weeks one to four, you learn how to build a proof concept, weeks five to eight, you need to get to this final level that we just described.

If you can get there, then you will understand like end to end, AI engineering end to end, and then you can do in your work, in your career, you can be doing a role where you're doing a part of that end to end process. Maybe you're doing the first, what we discovered in the first four weeks, or maybe you're doing the deployment, maybe you like that more, maybe you're doing something in the middle, but understanding that whole process end to end is critical for, like you can still get away with being an AI engineer without understanding it, but it will really set “you apart, like set you ahead of any competition, and like employers will be really keen on getting you on board because you bring so much value, you're like doing the job of two people, or you at least have the knowledge of two people of very related technologies.

Perfect. Thank you for this overview of all eight weeks of the AI Engineering Bootcamp. Sounds like an amazing curriculum, and so people can apply for cohorts at superdatascience.com/bootcamp.

That's correct.

But now that you've provided them with...

Just do it yourself.

Yeah, you can DIY it now as well.

Yeah, but if you are interested, our second cohort is launching on 29th of September, and they are, at the time of recording, there are still a few spots remaining in this cohort. So feel free to apply at superdatascience.com/bootcamp.

Exciting. Thanks, Kirill. Now, I know that if people want to be following you after this episode, the best place to get you is in the superdatascience.com platform.

That's absolutely right, yeah.

Is there anywhere else that people should be following you, or is that just about it?

You can follow me on LinkedIn as well. Like, I post “some insights from, like, these ones from Bootcamp sometimes, or from our new courses. That's about it.

Great. Well, thanks, Kirill. This has been a great episode, as we always expect, when you are a guest on the show.

Yeah. Thanks, Jon. Before we wrap up, what are your thoughts on, like, like, you've, I've been answering a lot of questions.

What are your thoughts on AI engineering? Like, do you think these, like, what we covered, is, is there anything more that an engineer should have, or is that a bit superfluous? Is there some things that you would cut out and think maybe that's not really necessary?

I think this is pretty good. I wasn't prepared for this question, so I don't have, like, a critical, a critical eye on this. As we were going through it, you know, the, I have more experience teaching and working with the kind of stuff that Ed was doing in the first four weeks.

And so I feel like I can answer kind of more confidently about those four and say that, you know, with four weeks, I think it's about as good as it could be. With weeks five through “eight, I'm less expert in that. And so for me, as we were going through that, I was kind of, you know, taking notes and, you know, literally, you know, in my notebook or in my brain, adding, you know, to my, to my reg index.

To your context window.

Yeah, adding it into my context window of, you know, these are skills that I need to be learning and becoming better at. And so, yeah, well, I, well, I, you know, I don't have much, I have less authority on weeks five through eight. It did strike me as relevant and important for somebody like me.

So I think it's at least directionally correct.

The reason why we came up with this specific structure is because a lot of participants when, not even participants, this was before we launched the bootcamp. A lot of people we were speaking with, they were saying that when they go to interviews, companies ask them about deployment. Companies were asking this.

And when we looked around, no bootcamp were providing. A lot of bootcamps were focusing on the AI, like science of AI. So yeah, it's an interesting thing and we're glad that “some of the participants already, at least one has already landed a job even before the bootcamp is over.

So we're sure many more will follow.

That's fantastic. And I'm sure there's also a lot of situations where enterprise clients are, it's not about somebody finding their next job or the next opportunity, but it's about being able to have scalable, secure, practical, cost-effective, agentic AI solutions running in their enterprise. And so it sounds like you're going to have quite a few of those use cases coming out of this as well.

Exactly.

Yeah, that's a good point. Yeah, absolutely. Thanks, Jon.    